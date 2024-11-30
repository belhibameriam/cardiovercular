import { Form, Input, Button, Card } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import authService from "../services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  // Handle form submission

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Form Submitted:", values);

    setLoading(true);

    authService.login(values.email, values.password).then(
      (response) => {
        console.log("Login Success:", response);


        



        // Save the token in local storage
        localStorage.setItem("access", response.access);
        localStorage.setItem("refresh", response.refresh);
        localStorage.setItem("name", response.name);
        localStorage.setItem("email", response.email);
        localStorage.setItem("id", response.id);

        navigate("/users");
        // Redirect to the dashboard
        // window.location.href = "/dashboard";
      },
      (error) => {
        console.error("Login Error:", error);
      }, 
    ).catch((error) => {
      console.error("Login Error:", error);
    }).finally(() => {
      setLoading(false);
    });

  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <Card className="w-full max-w-md shadow-lg p-8 bg-white rounded-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical" // better layout for input labels
        >
          {/* Email field */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "Please input your E-mail!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email"
            />
          </Form.Item>

          {/* Password field */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters long",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button w-full"
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
