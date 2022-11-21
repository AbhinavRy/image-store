import { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Input, Select, Checkbox, Row, Col, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from "./forms.module.scss";
import axios from "axios";
import { BASE_URL } from "../config";
import Cookie from 'js-cookie';
import AuthContext from '../AuthContext';
import { showMessage } from "./MessageComponent";
import { useRef } from 'react';
import { useEffect } from 'react';

const { Option } = Select;

const SignupForm = ({ setShowLogin }) => {
    const auth = AuthContext();
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [cCode, setCCode] = useState('+91');
    const [disableSignupBtn, setDisableSignupBtn] = useState(true);
    const [weakPass, setWeakPass] = useState('');
    const [passFocused, setPassFocused] = useState(false);
    const [openEmailModal, setOpenEmailModal] = useState(false);
    const [emailLink, setEmailLink] = useState('');

    const countryCode = (
        <Select
          defaultValue="+91"
          value={cCode}
          bordered={false}
          style={{
            width: 70,
            backgroundColor: "#fff",
            borderColor: "black",
          }}
          onChange={(value) => setCCode(value)}
        >
          <Option value="+91">+91</Option>
          <Option value="+1">+1</Option>
        </Select>
    );

    console.log("cookie",Cookie.get("authToken"))

    const onSignup = () => {
        if(!email || email == '') { 
            showMessage("Missing or invalid email");
            return;
        }
        if(!password || password == ''){
            showMessage("Missing password"); 
            return;
        }
        let passPattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
        if(!passPattern.test(password)){
            showMessage("Weak Password."); 
            return;
        }
        if(!fName || fName == '' || !lName || lName == ''){
            showMessage("Incomplete name fields"); 
            return;
        }
        if(!phone || phone == '' || !cCode || cCode == ''){
            showMessage("Missing phone number"); 
            return;
        }
        setDisableSignupBtn(true);
        axios.post(`${BASE_URL}/auth/signup`, 
            {
                emailId: email, 
                password, 
                firstName: fName, 
                lastName: lName, 
                phoneNo: {
                    countryCode: cCode,
                    number: phone
                },
            })
            .then(res => {
                if(!res.data.token){
                    showMessage(res.data?.message);
                    // setErrorMsg(res.data?.message);
                }
                else{
                    setOpenEmailModal(true);
                    setEmailLink(res.data.emailLink);
                    // setShowLogin(true);
                    // Cookie.set('authToken', res.data.token, { expires: 1 });
                    // auth.login();
                }
                setDisableSignupBtn(false);
            })
            .catch(err => {
                console.log(err);
                showMessage(err.response.data?.message);
                // setErrorMsg(err.response.data?.message);
                setDisableSignupBtn(false);
            })
    }

    const termsAgreement = (e) => {
        if(e.target.checked){
            setDisableSignupBtn(false);
        }
        else {
            setDisableSignupBtn(true);
        }
    }

    useEffect(() => {
        if(!passFocused){
            if(!password)
                setWeakPass(false);
        }
    }, [passFocused]);

    const handlePassword = (e) => {
        setPassword(e.target.value);
        let passPattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
        if(!passPattern.test(e.target.value)){
            setWeakPass(true);
        }
        else{
            setWeakPass(false);
        }
    }

    return (
        <div className={styles.loginFormWrapper}>
            <Modal 
                title="Email Verification: Open to verify email." 
                open={openEmailModal} 
                onOk={() =>setShowLogin(true)}
                okText={"Go to Login"}
            >
                <div className={styles.emailModal}>{emailLink ? <a target="_blank" href={emailLink}>{emailLink}</a> : "Something went wrong"}</div>
            </Modal>
            <div className={styles.welcomeText}>Begin your journey!</div>
            <div className={styles.descText}>Get started here</div>
            <div className={styles.compWrapper}>
                <Row justify="space-between">
                    <Col span={11}>
                        <div className={styles.inputLabel}>First Name*</div>
                        <Input
                            size="large"
                            value={fName}
                            onChange={(e) => setFName(e.target.value)}
                        />
                    </Col>
                    <Col span={11}>
                        <div className={styles.inputLabel}>Last Name*</div>
                        <Input
                            size="large"
                            value={lName}
                            onChange={(e) => setLName(e.target.value)} 
                        />
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col span={11}>
                        <div className={styles.inputLabel}>Email Address*</div>
                        <Input
                            size="large"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Col>
                    <Col span={11}>
                        <div className={styles.inputLabel}>Phone Number*</div>
                        <Input
                            size="large"
                            prefix={countryCode}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col span={11}>
                        <div className={styles.inputLabel}>Password*</div>
                        <Input.Password
                            size="large"
                            value={password}
                            onFocus={() => setPassFocused(true)}
                            onBlur={() => setPassFocused(false)}
                            onChange={handlePassword}
                            onPressEnter={onSignup}
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                        {
                            weakPass &&
                            <div className={styles.passMsg}>
                                <div className={styles.error}>Weak Password.</div>
                                <div className={styles.desc}>Try a combination of one Upper Case, one Lower Case, one Number and one Special Character</div>
                            </div>
                        }
                    </Col>
                </Row>
                <Checkbox onChange={termsAgreement}>By Signing up you agree to our <a>User Agreement</a>, <a>Terms of Service</a>, & <a>Privacy Policy</a></Checkbox>
                <Row>
                    <Col span={11}>
                        <Button className={styles.customButton} onClick={onSignup} disabled={disableSignupBtn}>
                            Sign Up
                        </Button>
                    </Col>
                </Row> 
            </div>
        </div>
    )
}

export default SignupForm