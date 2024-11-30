import React, { useEffect, useRef, useState } from 'react'
import { Annotorious } from '@recogito/annotorious';
import '@recogito/annotorious/dist/annotorious.min.css';
import SelectorPack from '@recogito/annotorious-selector-pack';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Spin, Upload } from 'antd';
import { FaRegSquare } from "react-icons/fa";
import { FaDrawPolygon } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { FaUndo } from "react-icons/fa";
import { FaRedo } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { List, Typography, Card } from 'antd';
import annotateService from '../../services/annotateService';
import './styles.css';
import { useParams } from 'react-router-dom';
import annotateFileService from '../../services/annotateFileService';
const { Text } = Typography;


let obj = [];
let obj1 = [];
let obj2 = [];
let obj3 = [];
let resetClick;



function AnnotateImage() {



    const { id } = useParams();

    const [object, setObject] = useState([]);
    const [object_1, setObject_1] = useState([]);
    const [object_2, setObject_2] = useState([]);
    const [object_3, setObject_3] = useState([]);

    const [annotationsFetched, setAnnotationsFetched] = useState(false);
    const [intiialAnnotations, setInitialAnnotations] = useState([]);

    const [saveLoading, setSaveLoading] = useState(false);

    // console.log(id);  


    const fetchFileToAnnotate = async () => {

      annotateFileService.getSingleDicomImage(id).then((res) => {
        console.log(res);
        setSelectedImage(import.meta.env.VITE_API_BASE_URL + res.image_url);
        setInitialAnnotations(res.annotations);
        setAnnotationsFetched(true);
      }).catch((error) => {
        console.error("Error fetching single dicom image", error);
      });

    }

  

    const addAnnotations = async () => {
      
      console.log("obj3", obj3);
      console.log("obj2", obj2);
      console.log("obj1", obj1);

      setSaveLoading(true);

  
      // let promises = obj3.map((annotation) => {
      //   let data = {...annotation};
      //   data.file_id = id;
      //   data.file_name = "null"
      //   data.file_size = 20
      //   return annotateService.addSingleAnnotation(data);
      // });

      // Promise.all(promises).then((res) => {
      //   console.log(res);
      
      // }).catch((error) => {
      //   console.error("Error adding single annotation", error);
      // })

      let data = {
        annotations: JSON.stringify(obj1),
      }

      console.log("Data", data);

      annotateFileService.addAnnnotationsToDicom(data, id).then((res) => {
        console.log(res);
        message.success('Annotations saved successfully');
      }).catch((error) => {
        console.error("Error adding annotations to dicom image", error);
      }).finally(() => {
        setSaveLoading(false);
      });


      
    }


    useEffect(() => {
      fetchFileToAnnotate();
    }, []);

    
    const imgEl = useRef();


    const [selectedImage, setSelectedImage] = useState(null);
    const [ anno, setAnno ] = useState();
    const [showS, setShowS] = useState(false);
    const [showD, setShowD] = useState(false);
    const [xyz, setXyz] = useState([]);
    const [selected, setSelected] = useState("btn1")
    const [ tool, setTool ] = useState('rect');

    const [uploadLoading, setUploadLoading] = useState(false);


    const postImage = async () => {

      setUploadLoading(true);

      const formData = new FormData();

      // formData.append('title', selectedImage.name);
      // formData.append('description', 'Annotated Image');
      // formData.append('dicom_file_id', 1);
      formData.append('image_url', selectedImage);

      annotateFileService.uploadFile(formData).then((res) => {
        console.log(res);
      }).catch((error) => {
        console.error("Error posting image", error);
      }).finally(() => {
        setUploadLoading(false);
      });
    }


    useEffect(() => {
      if (selectedImage) {
        postImage();
      }
    }, [selectedImage]);



  useEffect(() => {
    let annotorious = null;

    if(imgEl.current && annotationsFetched) {
        annotorious = new Annotorious({
            image: imgEl.current,
            crosshair: false
            , widgets: [
                'TAG', 'COMMENT'
              ]
          });

        console.log("Initial Annotations", intiialAnnotations);

        console.log("annotorious", annotorious);

        


        console.log("Annotations", annotorious.getAnnotations());

        
          if (intiialAnnotations) {
            setObject_1(intiialAnnotations);

            intiialAnnotations.map((annotation) => {
              annotorious.addAnnotation(annotation);
            });

          }


        

        SelectorPack(annotorious);


        // intiialAnnotations?.map((annotation) => {
        //   annotorious.addAnnotation(annotation);
        // });

        // const an = {
        //   "@context": "http://www.w3.org/ns/anno.jsonld", 
        //   "type": "Annotation", 
        //   "body": [
        //     {
        //       "type": "TextualBody", 
        //       "value": "dsd", 
        //       "purpose": "tagging"
        //     },
        //     {
        //       "type": "TextualBody", 
        //       "value": "sdsds", 
        //       "purpose": "commenting"
        //     }
        //   ],
        //   "target": {
        //     "source": "http://127.0.0.1:8000/frontend/public/dicom_images/1_1_1__00003927_000.png",
        //     "selector": {
        //       "type": "FragmentSelector",
        //       "conformsTo": "http://www.w3.org/TR/media-frags/",
        //       "value": "xywh=pixel:240.94117736816406,312.12835693359375,416.17112731933594,629.7326049804688"
        //     }
        //   },
        //   "id": "#a1e2971f-e012-4c09-8e66-54232070e632"
        // }
        
        
        // annotorious.addAnnotation(an);

        annotorious.on('createAnnotation', (annotation) => {
            console.log('Annotation created:', annotation);

            const annotations = annotorious.getAnnotations();

            let ob = [];
            let ob31T;
            let ob31C;
            let ob32T = "";
            let ob32C = "";


            for (let i = 0; i < annotations.length; i++) {
              ob.push({purpose:annotation.body[0].purpose, value:annotation.body[0].value})


              if (annotation.body[0].purpose === "tagging") {
                ob31T = "tagging"
                ob32T += annotation.body[0].value + ", "
              }
              if (annotation.body[0].purpose === "commenting") {
                ob31C = "commenting"
                ob32C += annotation.body[0].value + ", "
              }
            }

            if (annotation.target.selector.type === 'FragmentSelector') {
              let temp = {id:annotation.id, type:annotation.target.selector.type, value:(annotation.target.selector.value).slice(11,)}
              obj.push(temp)
              setObject([...object, temp]);
    
              obj1 = annotations;
              setObject_1(annotations);
    
              setXyz(obj1);
    
              let temp2 = {
                file_name:selectedImage?.name, 
                file_size:selectedImage?.size,
                region_count:annotations.length,
                region_id:annotation.id,
                region_shape_attributes:{tool_name:annotation.target.selector.type, value:(annotation.target.selector.value).slice(11,)},
                region_attributes:ob
              }
              obj2.push(temp2)
              setObject_2([...object_2, temp2]);
    
              let temp3 = {
                file_name:selectedImage?.name, 
                file_size:selectedImage?.size,
                region_count:annotations.length,
                region_id:annotation.id,
                region_shape_attributes_tool_name:annotation.target.selector.type,
                region_shape_attributes_value:annotation.target.selector.value.slice(11,),
                region_attributes_tag:ob31T,
                region_attributes_tag_value:ob32T,
                region_attributes_comment:ob31C,
                region_attributes_comment_value:ob32C
              }
              obj3.push(temp3)
              setObject_3([...object_3, temp3]);
            }
            else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='p') {
              let temp = {id:annotation.id, type:annotation.target.selector.type, value:(annotation.target.selector.value).slice(22,-18)}
              obj.push(temp) 
              setObject([...object, temp]);
    
              obj1 = annotations;
              setObject_1(annotations);
    
              setXyz(obj1);
    
              let temp2 = {
                file_name:selectedImage?.name, 
                file_size:selectedImage?.size, 
                region_count:annotations.length,
                region_id:annotation.id,
                region_shape_attributes:{tool_name:annotation.target.selector.type, value:(annotation.target.selector.value).slice(22,-18)},
                region_attributes:ob
              }
              obj2.push(temp2)
              setObject_2([...object_2, temp2]);
    
              let temp3 = {
                file_name:selectedImage?.name, 
                file_size:selectedImage?.size,
                region_count:annotations.length,
                region_id:annotation.id,
                region_shape_attributes_tool_name:annotation.target.selector.type,
                region_shape_attributes_value:annotation.target.selector.value.slice(22,-18),
                region_attributes_tag:ob31T,
                region_attributes_tag_value:ob32T,
                region_attributes_comment:ob31C,
                region_attributes_comment_value:ob32C
              }
              obj3.push(temp3)
              setObject_3([...object_3, temp3]);
            }
            else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='e') {
              let temp = {id:annotation.id, type:annotation.target.selector.type, value:(annotation.target.selector.value).slice(13,-17)}
              obj.push(temp) 
              setObject([...object, temp]);
    
              obj1 = annotations;
              setObject_1(annotations);
    
              setXyz(obj1);
    
              let temp2 = {
                file_name:selectedImage?.name, 
                file_size:selectedImage?.size, 
                region_count:annotations.length,
                region_id:annotation.id,
                region_shape_attributes:{tool_name:annotation.target.selector.type, value:(annotation.target.selector.value).slice(13,-17)},
                region_attributes:ob
              }
              obj2.push(temp2)
              setObject_2([...object_2, temp2]);
    
              let temp3 = {
                file_name:selectedImage?.name, 
                file_size:selectedImage?.size,
                region_count:annotations.length,
                region_id:annotation.id,
                region_shape_attributes_tool_name:annotation.target.selector.type,
                region_shape_attributes_value:annotation.target.selector.value.slice(13,-17),
                region_attributes_tag:ob31T,
                region_attributes_tag_value:ob32T,
                region_attributes_comment:ob31C,
                region_attributes_comment_value:ob32C
              }
              obj3.push(temp3)
              setObject_3([...object_3, temp3]);
              
            }
    
            for (let c in obj2) {
              obj2[c].region_count=annotations.length;
            }
            for (let c in obj3) {
              obj3[c].region_count=annotations.length;
            }


        });


        annotorious.on('updateAnnotation', (annotation, previous) => {
        
          const annotations = annotorious.getAnnotations();
  
          const index = obj.findIndex(i => {
            return i.id === annotation.id;
          });
          if (annotation.target.selector.type === 'FragmentSelector') {
            obj[index].value = (annotation.target.selector.value).slice(11,);

            setObject(obj);
  
            obj1 = annotations;
            setObject_1(annotations);
  
            setXyz(obj1);
          }
          else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='p'){
            obj[index].value = (annotation.target.selector.value).slice(22,-18);
            setObject(obj);
  
            obj1 = annotations;
            setObject_1(annotations);
  
            setXyz(obj1);
          }
          else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='e'){
            obj[index].value = (annotation.target.selector.value).slice(13,-17);
            setObject(obj);
  
            obj1 = annotations;
            setObject_1(annotations);
  
            setXyz(obj1);
          }
  
          let ob = [];
          let ob31T;
          let ob31C;
          let ob32T = "";
          let ob32C = "";
  
  
          for (let o=0; o < annotation.body.length; o++) {
            ob.push({purpose:annotation.body[0].purpose, value:annotation.body[0].value})
  
            if (annotation.body[0].purpose === "tagging") {
              ob31T = "tagging"
              ob32T += annotation.body[0].value + ", "
            }
            if (annotation.body[0].purpose === "commenting" || annotation.body[0].purpose === "replying") {
              ob31C = "commenting"
              ob32C += annotation.body[0].value + ", "
            }
          }
  
          const index2 = obj2.findIndex(i2 => {
            return i2.region_id === annotation.id;
          });
          if (annotation.target.selector.type === 'FragmentSelector') {
            obj2[index2].region_shape_attributes.value = (annotation.target.selector.value).slice(11,);
            obj2[index2].region_attributes = ob;

            setObject_2(obj2);
          }
          else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='p'){
            obj2[index2].region_shape_attributes.value = (annotation.target.selector.value).slice(22,-18);
            obj2[index2].region_attributes = ob;
            setObject_2(obj2);
          }
          else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='e'){
            obj2[index2].region_shape_attributes.value = (annotation.target.selector.value).slice(13,-17);
            obj2[index2].region_attributes = ob;
            setObject_2(obj2);
          }
  
          for (let c in obj2) {
            obj2[c].region_count=annotations.length;
          }

          setObject_2(obj2);
  
  
          const index3 = obj3.findIndex(i3 => {
              return i3.region_id === annotation.id;
            });
            if (annotation.target.selector.type === 'FragmentSelector') {
              obj3[index3].region_shape_attributes_value = (annotation.target.selector.value).slice(11,);
              obj3[index3].region_attributes_tag = ob31T;
              obj3[index3].region_attributes_tag_value = ob32T;
              obj3[index3].region_attributes_comment = ob31C;
              obj3[index3].region_attributes_comment_value = ob32C;
            }
            else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='p'){
              obj3[index3].region_shape_attributes_value = (annotation.target.selector.value).slice(22,-18);
              obj3[index3].region_attributes_tag = ob31T;
              obj3[index3].region_attributes_tag_value = ob32T;
              obj3[index3].region_attributes_comment = ob31C;
              obj3[index3].region_attributes_comment_value = ob32C;
            }
            else if (annotation.target.selector.type === 'SvgSelector' && annotation.target.selector.value.slice(6,7) ==='e'){
              obj3[index3].region_shape_attributes_value = (annotation.target.selector.value).slice(13,-17);
              obj3[index3].region_attributes_tag = ob31T;
              obj3[index3].region_attributes_tag_value = ob32T;
              obj3[index3].region_attributes_comment = ob31C;
              obj3[index3].region_attributes_comment_value = ob32C;
            }
    
            for (let c in obj3) {
              obj3[c].region_count=annotations.length;
            }

            setObject_3(obj3);
  
        });
  
        annotorious.on('deleteAnnotation', annotation => {
  
          const annotations = annotorious.getAnnotations();
  
          const indexOfObject = obj.findIndex(object => {
            return object.id === annotation.id;
          });
          
          obj = [
            ...obj.slice(0, indexOfObject),
            ...obj.slice(indexOfObject + 1),
          ];

          setObject(obj);
  
          obj1 = annotations;
          setObject_1(annotations);
  
          setXyz(obj1);
  
          const indexOfObject2 = obj2.findIndex(object2 => {
            return object2.region_id === annotation.id;
          });
  
          const indexOfObject3 = obj3.findIndex(object3 => {
              return object3.region_id === annotation.id;
            });
  
          obj2 = [
            ...obj2.slice(0, indexOfObject2),
            ...obj2.slice(indexOfObject2 + 1),
          ];

          
  
          obj3 = [
            ...obj3.slice(0, indexOfObject3),
            ...obj3.slice(indexOfObject3 + 1),
          ];
  
          for (let c in obj2) {
            obj2[c].region_count=annotations.length;
          }
  
          for (let c in obj3) {
            obj3[c].region_count=annotations.length;
          }

          setObject_2(obj2);
          setObject_3(obj3);
        });



    }

    
    setAnno(annotorious);

    // return () => annotorious.destroy();

 }, [selectedImage, annotationsFetched]);

 const rectTool = () => {
  if (tool === 'polygon' || tool === 'ellipse') {
    setTool('rect');
    anno.setDrawingTool('rect');
  }

  }

  const polygonTool = () => {
    if (tool === 'rect' || tool === 'ellipse') {
      setTool('polygon');
      anno.setDrawingTool('polygon');
    
    }
  }

  const circleTool = () => {

    if (tool === 'rect' || tool === 'polygon') {
      setTool('ellipse');
      anno.setDrawingTool('ellipse');
    }

  }
    
  const exportData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(obj2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "annotations.json";
    link.click();
  };

  resetClick = () => {
    if(window.confirm("You will lose all annotations! Do you want to proceed?")) {
    obj.splice(0,obj.length)
    obj1.splice(0,obj1.length)
    obj2.splice(0,obj2.length)
    obj3.splice(0,obj3.length)

    setObject([]);
    setObject_1([]);
    setObject_2([]);
    setObject_3([]);
    


    return anno.clearAnnotations();}
  };

  const [isShownAnno, setIsShownAnno] = useState(true);  


  const hideOrShow = () => {
    if (isShownAnno) {
      anno.setVisible(false);
      setIsShownAnno(false);
    } 
    else {
      anno.setVisible(true);
      setIsShownAnno(true);
    }
  }







  return (
    <div>
      <h2 className="text-2xl font-medium ml-2 mb-4">Annotate</h2>
      {/* <Upload 
        onChange={(e) => {
          console.log(e);
          setSelectedImage(e.file.originFileObj);
        }}
      > 
    <Button icon={<UploadOutlined />}>Click to Upload</Button>

  </Upload>

  {
    uploadLoading && <div className='flex-col items-center justify-center w-full'>
        <Spin />
        <p
          className="text-lg font-medium"
        >Uploading...</p>
      </div>

  } */}

  {
    selectedImage && <div>
      <img ref={imgEl} src={selectedImage} alt="Selected" 
        
      />
      <div className="flex justify-center mt-4">
        <Button icon={<FaRegSquare />}
          onClick={rectTool}
          active={tool === 'rect'}
        >Rectangle</Button>
        <Button icon={<FaDrawPolygon />}
          active={tool === 'polygon'}
          onClick={polygonTool}
        >Polygon</Button>
        <Button icon={<FaRegCircle />}
          active={tool === 'ellipse'}
          onClick={circleTool}
        >Circle</Button>
        <Button icon={<IoMdDownload />}
          onClick={exportData}
        >Download</Button>
        {/* <Button icon={<FaUndo />}
          onClick={undoClick}
        >Undo</Button>
        <Button icon={<FaRedo />}
          onClick={redoClick}
        >Redo</Button> */}
        <Button icon={
          isShownAnno ? <FaEye /> : <FaEyeSlash />
        }
          onClick={hideOrShow}
        >
          {isShownAnno ? 'Hide' : 'Show'}
        </Button>
        <Button icon={<FaSave />}
          onClick={addAnnotations}
          loading={saveLoading}
        >Save</Button>
        {/* <Button icon={<GrPowerReset />}
          onClick={resetClick}
        >Reset
        </Button> */}
      </div>


      <div>
      <List
    dataSource={object_1}
    renderItem={(annotation) => (
      <List.Item>
        <Card style={{ width: '100%' }}>
          <Text strong>ID: </Text>
          <Text>{annotation.id}</Text>
          <br />
          <Text strong>Type: </Text>
          <Text>{annotation.type}</Text>
          <br />
          <Text strong>Target Source: </Text>
          <Text>{annotation.target.source}</Text>
          <br />
          
          {/* Rendering the Body items */}
          <Text strong>Body:</Text>
          <List
            dataSource={annotation.body}
            renderItem={(bodyItem) => (
              <List.Item>
                <Text strong>Type: </Text>
                <Text>{bodyItem.type}</Text>
                <br />
                <Text strong>Value: </Text>
                <Text>{bodyItem.value}</Text>
                <br />
                <Text strong>Purpose: </Text>
                <Text>{bodyItem.purpose}</Text>
              </List.Item>
            )}
          />
        </Card>
      </List.Item>
    )}
  />
    {/* <Button  className="mt-4 mb-4" onClick={addAnnotations}>Save Annotations</Button> */}
  </div>
    </div>
  }
    </div>
  )
}

export default AnnotateImage