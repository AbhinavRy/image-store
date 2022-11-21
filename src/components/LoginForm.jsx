import { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Checkbox, Input, Row, Col } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from "./forms.module.scss";
import axios from "axios";
import { BASE_URL } from "../config";
import AuthContext from '../AuthContext';
import Cookie from "js-cookie";
import { showMessage } from "./MessageComponent";

const LoginForm = () => {
    const auth = AuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [disableLoginBtn, setDisableLoginBtn] = useState(false);
    
    const onLogin = () => {
        if(!email || email == '') { 
            showMessage("Missing or invalid email");
            return;
        }
        if(!password || password == ''){
            showMessage("Missing password"); 
            return;
        }
        setDisableLoginBtn(true);
        axios.post(`${BASE_URL}/auth/login`, 
            {
                emailId: email,
                password,
                rememberMe,
            })
            .then(res => {
                console.log(res)
                if(!res?.data?.token){
                    showMessage(res?.data?.message);
                }
                else{
                    // Cookie.remove('authToken');
                    // console.log("token received", res.data.token)
                    // if(rememberMe){
                    //     Cookie.set('authToken', res.data.token, { expires: 7 });
                    // }
                    // else{
                    //     Cookie.set('authToken', res.data.token, { expires: 1 });
                    // }
                    auth.login();
                }
                setDisableLoginBtn(false);
            })
            .catch(err => {
                console.log(err);
                showMessage(err.response.data?.message);
                setDisableLoginBtn(false);
            })
    }

    const handleEnterPress = (e) => {
        if(e.key == "Enter" && !disableLoginBtn){
            onLogin();
        }
    }

    return (
        <div className={styles.loginFormWrapper}>
            <div className={styles.welcomeText}>Welcome back!</div>
            <div className={styles.descText}>Please Enter your details.</div>
            <div className={styles.compWrapper}>
                <Row>
                    <Col span={11}>
                        <div className={styles.inputLabel}>Email Address*</div>
                        <Input
                            size="large"
                            value={email}
                            placeholder="Jhonathan@abc.com"
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <div className={styles.inputLabel}>Password*</div>
                        <Input.Password
                            size="large"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleEnterPress}
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <div className={styles.additionalFt}>
                            <div className={styles.forgotText}>
                                <Checkbox onChange={(value) => setRememberMe(value)}>Remember me</Checkbox>
                            </div>
                            <a>
                                Forgot Password?
                            </a>
                        </div>
                    </Col>
                </Row>
                
                <Row>
                    <Col span={11}>
                        <Button className={styles.customButton} onClick={onLogin}>
                            Log In
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default LoginForm