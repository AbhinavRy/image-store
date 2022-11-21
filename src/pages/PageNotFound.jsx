import { useNavigate } from 'react-router-dom';
import styles from "./pagenotfound.module.scss";
import Image404 from "../assets/page404Img.svg";
import ArrowLeft from "../assets/arrowleft.svg";
import Four from "../assets/four.svg";
import { Button, Image } from 'antd';
import { ArrowLeftOutlined } from "@ant-design/icons";

const PageNotFound = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.notFoundWrapper}>
            <div className={styles.text404}>
                <Image src={Four} preview={false}/>
                <Image src={Image404} preview={false}/>
                <Image src={Four} preview={false}/>
            </div>
            <div className={styles.miscText}>
                <div>oops! looks like you are lost.</div>
                <div>The page you are looking for could not be found.</div>
            </div>
            <Button 
                onClick={() => navigate('/')}
                className={styles.backHomeBtn} 
                icon={<ArrowLeftOutlined className={styles.arrowLeft} />}
            >
                Back to home
            </Button>
        </div>
    )
}

export default PageNotFound