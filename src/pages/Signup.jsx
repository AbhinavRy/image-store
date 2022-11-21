import { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import styles from "./signup.module.scss";
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import axios from 'axios';
import { BASE_URL } from '../config';
import AuthContext from '../AuthContext';

const Login = () => {
    const auth = AuthContext();
    const [showLogin, setShowLogin] = useState(false);
    
    useEffect(() => {
        axios.get(`${BASE_URL}/auth/authcheck`)
          .then(res => {
            auth.login();
          })
      },[]);

    return (
        <div>
            <Row>
                <Col span={8} className={styles.blueBg}>
                    <div className={styles.welcomeWrapper}>
                        <div className={styles.welcomeText}>Welcome to Media Store.</div>
                        <div className={styles.miscText}>Create an account or Login to get started.</div>
                    </div>
                </Col>
                <Col span={16} className={styles.formWrapper}>
                    {
                        showLogin ?
                        <LoginForm/>
                        : <SignupForm setShowLogin={setShowLogin} />
                    }
                    {
                        !showLogin &&
                        <div className={styles.loginButton}>Already have an account? <a onClick={() => setShowLogin(true)}>Log In</a></div>
                    }
                </Col>
            </Row>
        </div>
    )
}

export default Login