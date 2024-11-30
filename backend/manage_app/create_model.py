import joblib
import tensorflow as tf
from tensorflow.keras.layers import Dense,GlobalAveragePooling2D, Input, Embedding, LSTM,Dot,Reshape,Concatenate,BatchNormalization, GlobalMaxPooling2D, Dropout, Add, MaxPooling2D, GRU, AveragePooling2D
import numpy as np
import cv2


chexnet_weights = "C:/Users/Utilisateur/Final_Project_PFE - v1/backend/manage_app/brucechou1983_CheXNet_Keras_0.3.0_weights.h5"

def create_chexnet(chexnet_weights = chexnet_weights,input_size=(224,224)):
  """
  chexnet_weights: weights value in .h5 format of chexnet
  creates a chexnet model with preloaded weights present in chexnet_weights file
  """
  model = tf.keras.applications.DenseNet121(include_top=False,input_shape = input_size+(3,)) 

  x = model.output 
  x = GlobalAveragePooling2D()(x)
  x = Dense(14, activation="sigmoid", name="chexnet_output")(x) 

  chexnet = tf.keras.Model(inputs = model.input,outputs = x)
  chexnet.load_weights(chexnet_weights)
  chexnet = tf.keras.Model(inputs = model.input,outputs = chexnet.layers[-3].output)  

  return chexnet


class Image_encoder(tf.keras.layers.Layer):
  """
  This layer will output image backbone features after passing it through chexnet
  """
  def __init__(self,
    name = "image_encoder_block"
    ):
    super().__init__()
    self.chexnet = create_chexnet(input_size = (224,224))
    self.chexnet.trainable = False
    self.avgpool = AveragePooling2D()
    
    
  def call(self,data):
    op = self.chexnet(data) 
    op = self.avgpool(op) 
    op = tf.reshape(op,shape = (-1,op.shape[1]*op.shape[2],op.shape[3])) 
    return op


def encoder(image1,image2,dense_dim,dropout_rate):
  """
  Takes image1,image2
  gets the final encoded vector of these
  """
  #image1
  im_encoder = Image_encoder()
  bkfeat1 = im_encoder(image1) 
  bk_dense = Dense(dense_dim,name = 'bkdense',activation = 'relu') 
  bkfeat1 = bk_dense(bkfeat1)

  #image2
  bkfeat2 = im_encoder(image2) 
  bkfeat2 = bk_dense(bkfeat2) 


  #combining image1 and image2
  concat = Concatenate(axis=1)([bkfeat1,bkfeat2]) 
  bn = BatchNormalization(name = "encoder_batch_norm")(concat) 
  dropout = Dropout(dropout_rate,name = "encoder_dropout")(bn)
  return dropout


class global_attention(tf.keras.layers.Layer):
  """
  calculate global attention
  """
  def __init__(self,dense_dim):
    super().__init__()
    self.W1 = Dense(units = dense_dim) 
    self.W2 = Dense(units = dense_dim) 
    self.V = Dense(units = 1) 


  def call(self,encoder_output,decoder_h): 
    decoder_h = tf.expand_dims(decoder_h,axis=1) 
    tanh_input = self.W1(encoder_output) + self.W2(decoder_h) 
    tanh_output =  tf.nn.tanh(tanh_input)
    attention_weights = tf.nn.softmax(self.V(tanh_output),axis=1) 
    op = attention_weights*encoder_output
    context_vector = tf.reduce_sum(op,axis=1) 


    return context_vector,attention_weights


class One_Step_Decoder(tf.keras.layers.Layer):
  """
  decodes a single token
  """
  def __init__(self,vocab_size, embedding_dim, max_pad, dense_dim ,name = "onestepdecoder"):
    super().__init__()
    self.dense_dim = dense_dim
    self.embedding = Embedding(input_dim = vocab_size+1,
                                output_dim = embedding_dim,
                                input_length=max_pad,
                                mask_zero=True, 
                                name = 'onestepdecoder_embedding'
                              )
    self.LSTM = GRU(units=self.dense_dim,
                    return_state=True,
                    name = 'onestepdecoder_LSTM'
                    )
    self.attention = global_attention(dense_dim = dense_dim)
    self.concat = Concatenate(axis=-1)
    self.dense = Dense(dense_dim,name = 'onestepdecoder_embedding_dense',activation = 'relu')
    self.final = Dense(vocab_size+1,activation='softmax')
    self.concat = Concatenate(axis=-1)
    self.add =Add()
  @tf.function
  def call(self,input_to_decoder, encoder_output, decoder_h):
    ''' 
        One step decoder mechanisim step by step:
      A. Pass the input_to_decoder to the embedding layer and then get the output(batch_size,1,embedding_dim)
      B. Using the encoder_output and decoder hidden state, compute the context vector.
      C. Concat the context vector with the step A output
      D. Pass the Step-C output to LSTM/GRU and get the decoder output and states(hidden and cell state)
      E. Pass the decoder output to dense layer(vocab size) and store the result into output.
      F. Return the states from step D, output from Step E, attention weights from Step -B

      here state_h,state_c are decoder states
    ''' 
    embedding_op = self.embedding(input_to_decoder) 
    

    context_vector,attention_weights = self.attention(encoder_output,decoder_h) 
    context_vector_time_axis = tf.expand_dims(context_vector,axis=1)
    concat_input = self.concat([context_vector_time_axis,embedding_op])
    
    output,decoder_h = self.LSTM(concat_input,initial_state = decoder_h)
    

    output = self.final(output)
    return output,decoder_h,attention_weights


class decoder(tf.keras.Model):
  """
  Decodes the encoder output and caption
  """
  def __init__(self,max_pad, embedding_dim,dense_dim,batch_size ,vocab_size):
    super().__init__()
    self.onestepdecoder = One_Step_Decoder(vocab_size = vocab_size, embedding_dim = embedding_dim, max_pad = max_pad, dense_dim = dense_dim)
    self.output_array = tf.TensorArray(tf.float32,size=max_pad)
    self.max_pad = max_pad
    self.batch_size = batch_size
    self.dense_dim =dense_dim
    
  @tf.function
  def call(self,encoder_output,caption):
    decoder_h, decoder_c = tf.zeros_like(encoder_output[:,0]), tf.zeros_like(encoder_output[:,0]) 
    output_array = tf.TensorArray(tf.float32,size=self.max_pad)
    for timestep in range(self.max_pad): 
      output,decoder_h,attention_weights = self.onestepdecoder(caption[:,timestep:timestep+1], encoder_output, decoder_h)
      output_array = output_array.write(timestep,output) 

    self.output_array = tf.transpose(output_array.stack(),[1,0,2]) 
    return self.output_array


def create_model():
  """
  creates the best model ie the attention model
  and returns the model after loading the weights
  and also the tokenizer
  """
  #hyperparameters
  input_size = (224,224)
  tokenizer = joblib.load('C:/Users/Utilisateur/Final_Project_PFE - Romaissa/backend/manage_app/tokenizer.pkl')
  max_pad = 29
  batch_size = 100
  vocab_size = len(tokenizer.word_index)
  embedding_dim = 300
  dense_dim = 512
  lstm_units = dense_dim
  dropout_rate = 0.2


  tf.keras.backend.clear_session()
  image1 = Input(shape = (input_size + (3,))) 
  image2 = Input(shape = (input_size + (3,))) 
  caption = Input(shape = (max_pad,))

  encoder_output = encoder(image1,image2,dense_dim,dropout_rate) 

  output = decoder(max_pad, embedding_dim,dense_dim,batch_size ,vocab_size)(encoder_output,caption)
  model = tf.keras.Model(inputs = [image1,image2,caption], outputs = output)
  model_filename = 'C:/Users/Utilisateur/Final_Project_PFE - Romaissa/backend/manage_app/Encoder_Decoder_global_attention.h5'
  model_save = model_filename
  model.load_weights(model_save)

  return model,tokenizer


def greedy_search_predict(image1,image2,model,tokenizer,input_size = (224,224)):
  """
  Given paths to two x-ray images predicts the impression part of the x-ray in a greedy search algorithm
  """
  image1 = tf.expand_dims(cv2.resize(image1,input_size,interpolation = cv2.INTER_NEAREST),axis=0) 
  image2 = tf.expand_dims(cv2.resize(image2,input_size,interpolation = cv2.INTER_NEAREST),axis=0)
  image1 = model.get_layer('image_encoder')(image1)
  image2 = model.get_layer('image_encoder')(image2)
  image1 = model.get_layer('bkdense')(image1)
  image2 = model.get_layer('bkdense')(image2)

  concat = model.get_layer('concatenate')([image1,image2])
  enc_op = model.get_layer('encoder_batch_norm')(concat)  
  enc_op = model.get_layer('encoder_dropout')(enc_op) 


  decoder_h,decoder_c = tf.zeros_like(enc_op[:,0]),tf.zeros_like(enc_op[:,0])
  a = []
  pred = []
  max_pad = 29
  for i in range(max_pad):
    if i==0: 
      caption = np.array(tokenizer.texts_to_sequences(['<cls>'])) 
    output,decoder_h,attention_weights = model.get_layer('decoder').onestepdecoder(caption,enc_op,decoder_h)

    
    max_prob = tf.argmax(output,axis=-1)  
    caption = np.array([max_prob]) 
    if max_prob==np.squeeze(tokenizer.texts_to_sequences(['<end>'])): 
      break;
    else:
      a.append(tf.squeeze(max_prob).numpy())
  return tokenizer.sequences_to_texts([a])[0] 


def predict1(image1,image2=None,model_tokenizer = None):
  """given image1 and image 2 filepaths returns the predicted caption,
  the model_tokenizer will contain stored model_weights and tokenizer 
  """
  if image2 is None: 
    image2 = image1


  if model_tokenizer == None:
    model,tokenizer = create_model()
  else:
    model,tokenizer = model_tokenizer[0],model_tokenizer[1]
  predicted_caption = greedy_search_predict(image1,image2,model,tokenizer)

  return predicted_caption



def function1(image1,image2,model_tokenizer = None):
  """
  here image1 and image2 will be a list of image
  filepaths and outputs the resulting captions as a list
  """
  if model_tokenizer is None:
    model_tokenizer = list(create_model())
  predicted_caption = []
  for i1,i2 in zip(image1,image2):
    caption = predict1(i1,i2,model_tokenizer)
    predicted_caption.append(caption)

  return predicted_caption
