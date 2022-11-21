import { useState, useEffect } from 'react';
import styles from "./mediapage.module.scss";
import NoImg from "../assets/uploadImg.svg";
import { Button, Modal, Upload, Tooltip, Image, Spin, Checkbox, Progress } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { BASE_URL } from "../config";
import AuthContext from '../AuthContext';
import axios from 'axios';
import { showMessage } from '../components/MessageComponent';

const { Dragger } = Upload;

const MediaPage = () => {
    const auth = AuthContext();
    const [imageCount, setImageCount] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [fetchComplete, setFetchComplete] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(0);
    const [mediaData, setMediaData] = useState([]);
    const [checkedImages, setCheckedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadController, setUploadController] = useState(null);

    const fetchMedia = () => {
        axios.get(`${BASE_URL}/media`)
            .then(res => {
                if(res.data && res.data.data){
                    // auth.login();
                    setMediaData(res.data.data || []);
                    setFetchComplete(true);
                }
                else if (res.status == 401){
                    auth.logout();
                }
            })
            .catch(err => {
                if(err.response.status == 401){
                    auth.logout();
                }
                console.log(err);
                // showMessage(err.response.data?.message);
            })
    }

    useEffect(() => {
        setFileList([]);
        fetchMedia();
    },[]);

    useEffect(() => {
        if(fetchComplete){
            auth.setAuth();
        }
    }, [fetchComplete]);

    const fileUploadProps = {
        name: 'file',
        fileList: fileList,
        listType: 'picture-card',
        accept: 'image/png, image/jpeg',
        multiple: true,
        // itemRender(node, file){
        //     return <img className={styles.} src={file.thumbUrl}/>
        // },
        beforeUpload() {return false},
        onChange(f) {
            setFileList(f.fileList);
        },
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
          setFileList([...fileList, ...Object.values(e.dataTransfer.files)]);
        },
    };

    const handleShowModal = () => {
        setFileList([]);
        setShowUploadModal(true);
    }

    const handleCancelModal = () => {
        setShowUploadModal(false);
        setFileList([]);
    }

    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = () => {
        setUploading(true);
        const bodyFormData = new FormData();
        for(const obj of fileList){
            bodyFormData.append('image', obj.originFileObj);
        }

        const controller = new AbortController();
        setUploadController(controller);

        const config = {
            // cancel: cancelToken,
            signal: controller.signal,
            onUploadProgress: function(progressEvent) {
                console.log("loaded",progressEvent.loaded)
                console.log("total",progressEvent.total)
                const percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                setUploadProgress(percentCompleted);
                // if(percentCompleted === 100){

                // }
            }
        }
        
        axios.post(`${BASE_URL}/media/upload`, bodyFormData, config)
            .then(res => {
                if(res.status == 401){
                    auth.logout();
                }
                else{
                    setShowUploadModal(false);
                    fetchMedia();
                }
                setUploading(false);
            })
            .catch(err => {
                if(err.response.status == 401){
                    auth.logout();
                }
                console.log(err);
                showMessage(err.response.data?.message);
                setUploading(false);
            })
    }

    const truncatedStr = (str) => {
        if(str.length > 12){
            return str.substring(0, 10) + "...";
        }
        return str;
    }

    const handleImageCheck = (image, checked) => {
        if(checked){
            setCheckedImages([...checkedImages, image.cloudinary_id]);
        }
        else{
            setCheckedImages(checkedImages.filter(x => x !== image.cloudinary_id));
        }
    }

    const handleDelSelected = () => {
        if(checkedImages.length){
            setDeleting(true);
            axios.delete(`${BASE_URL}/media`, { params: { mediaId: checkedImages } })
                .then(res => {
                    fetchMedia();
                    setDeleting(false);
                    setCheckedImages([]);
                })
                .catch(err => {
                    console.log(err);
                    showMessage(err.response?.data?.message || "Unable to delete media.");
                    setDeleting(false);
                })
        }
    }

    const handleRemoveUploadImg = (image) => {
        setFileList(fileList.filter(x => x.uid !== image.uid));
    }
    
    console.log(fileList);

    const customLoad = () => (
        <LoadingOutlined
          style={{
            fontSize: 24,
          }}
          spin
        />
    );

    const uploadBtnProps = {
        // fileList: [],
        accept: 'image/png, image/jpeg',
        multiple: true,
        beforeUpload() {return false},
        onChange(f) {
            setFileList([...fileList,...f.fileList]);
        },
        previewFile() {return null},
    }

    const handleUploadCancel = () => {
        uploadController.abort();
        setUploading(false);
        handleCancelModal();
    }

    const FooterBtns = () => (
        <div className={styles.modalFooter}>
            <Upload {...uploadBtnProps}>
                <Button className={styles.addMoreBtn}>
                    Add more
                </Button>
            </Upload>
            <Button className={styles.uploadBtn} onClick={handleUpload}>{uploading ? <Spin/> : "Upload"}</Button>
        </div>
    )

    const footerShow = () => {
        if(uploading){
            return {
                footer: [
                    <div className={styles.cancelUploadWrapper}><Button className={styles.cancelUploadBtn} onClick={handleUploadCancel}>Cancel</Button></div>
                ]
            }
        }
        if(fileList.length)
            return { 
                footer: [
                    <FooterBtns/>
                ]
            }
        return { footer: null }
    }
   
    const convertBytes = (x) => {
        const units = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
        let l = 0, n = parseInt(x, 10) || 0;
        while(n >= 1024 && ++l){
            n = n/1024;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }

    const getImg = (file) => {
        // return new Promise(resolve => {
        //     let fileInfo;
        //     let baseURL = "";
        //     // Make new FileReader
        //     let reader = new FileReader();
      
        //     // Convert the file to base64 text
        //     reader.readAsDataURL(file.originFileObj);
      
        //     // on reader load somthing...
        //     reader.onload = () => {
        //       // Make a fileInfo Object
        //       console.log("Called", reader);
        //       baseURL = reader.result;
        //       console.log(baseURL);
        //       resolve(baseURL);
        //     };
        //     console.log(fileInfo);
        // });
        var reader = new FileReader();
        reader.onload = (e) => {
            file.base64 = e.target.result;
            setBase64Files([...base64Files, { uid: file.uid, }]);
        };
        reader.readAsDataURL(file.originFileObj)
        return file.base64;
        // // return reader.readAsDataURL(file);
    }

    const [base64Files, setBase64Files] = useState([]);

    useEffect(() => {
        if(base64Files.length){
            setRefreshPrevImg(true);
            setRefreshPrevImg(false);
        }
    },[base64Files]);

    const [refreshPrevImg, setRefreshPrevImg] = useState(false);

    return (
        <div className={styles.mediaPageWrapper}>
            { 
                fetchComplete &&
                <span>
                    <div className={styles.pageHeader}>
                        <div>
                            <div className={styles.pageHeadingTxt}>Media Library</div>
                            <div className={styles.imgCount}>{mediaData.length} images</div>
                        </div>
                        <div className={styles.actionBtns}>
                            <Button 
                                className={styles.customUploadBtn}
                                icon={<PlusCircleOutlined />}
                                onClick={handleShowModal}
                            >
                                Upload new image
                            </Button>
                            {
                                checkedImages.length > 0 &&
                                <Button 
                                    className={styles.customDeleteBtn} 
                                    icon={
                                        deleting ? 
                                        <Spin indicator={customLoad}/> 
                                        : <DeleteOutlined />
                                    }
                                    onClick={handleDelSelected}
                                    disabled={deleting}
                                >
                                    Delete selected
                                </Button>
                            }
                        </div>
                    </div>
                    <Modal 
                        width={700}
                        style={{borderRadius: "4px"}}
                        title={uploading ? "Uploading" : "Upload new images"}
                        centered={true}
                        open={showUploadModal} 
                        onCancel={handleCancelModal}
                        {...footerShow() }
                    >
                        {
                            fileList.length === 0 ?
                            <Dragger 
                                // style={fileList.length === 0 ? { display: "block" }: { display: "none" } } 
                                {...fileUploadProps}
                            >
                                <div>Drag Files here</div>
                                <div>or</div>
                                <Button className={styles.browseBtn}>Browse</Button>
                            </Dragger>
                            :
                            <div>
                                <div className={styles.prevWrapper}>
                                {/* <span 
                                    className={styles.prevFileCross}
                                    onClick={() => {setRefreshPrevImg(true); setRefreshPrevImg(false)}}
                                >
                                    Refresh
                                </span> */}
                                    {
                                        fileList.map((x,i) => {
                                            return (
                                                <div key={i} className={styles.previewImg}>
                                                    <span 
                                                        className={styles.prevFileCross}
                                                        onClick={() => handleRemoveUploadImg(x)}
                                                    >
                                                        &#10006;
                                                    </span>
                                                    {
                                                        !refreshPrevImg &&
                                                        <Image 
                                                            height={86} 
                                                            width={92} 
                                                            preview={false}
                                                            style={{ objectFit: "cover" }}
                                                            className={styles.customPrevFile} 
                                                            // src={x.originFileObj}
                                                            src={x.base64 || getImg(x)}
                                                            // src={getImg(x).then(x => {return x})}
                                                        />
                                                    }
                                                    <div className={styles.prevFileFooter}>
                                                        <div 
                                                            className={styles.prevFileName}
                                                        >
                                                            <Tooltip 
                                                                title={x.name}
                                                            >
                                                                {truncatedStr(x.name)}
                                                            </Tooltip>
                                                        </div>
                                                        <div 
                                                            className={styles.prevFileSize}
                                                        >
                                                            {convertBytes(x.size)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                {
                                    uploading &&
                                    <div className={styles.uploadProgressWrapper}>
                                        <Progress strokeColor={"#6360AB"} percent={uploadProgress} showInfo={false} />
                                        <div className={styles.timer}>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                    </Modal>
                    {
                        mediaData.length === 0 && 
                        (
                            fetchComplete ?
                            <div className={styles.placeholderDiv}>
                                
                                    <div>
                                        <img src={NoImg}/>
                                        <div className={styles.uploadText}>Click on 'Upload' to start adding images</div>
                                    </div>
                            </div>
                            :
                            <div className={styles.spinnerDiv}>
                                <Spin className={styles.customSpinner} size="large"/>
                            </div>
                        )
                    }
                    <div className={styles.mediaWrapper}>
                        {
                            mediaData.length > 0 && 
                            fetchComplete &&
                            <div className={styles.imageGallery}>
                                {
                                    mediaData.map((x,i) => {
                                        return (
                                            <div key={i} className={styles.imageWrapper}>
                                                <span 
                                                    className={styles.imageCheckBox}
                                                >
                                                    <Checkbox 
                                                        value={checkedImages.includes(x.cloudinary_id)} 
                                                        onChange={(e) => handleImageCheck(x, e.target.checked)}
                                                    ></Checkbox>
                                                </span>
                                                <Image 
                                                    height={240} 
                                                    width={300} 
                                                    className={styles.customImg} 
                                                    src={x.url}
                                                />
                                                <div className={styles.imageFooter}>
                                                    <span 
                                                        className={styles.imageName}
                                                    >
                                                        <Tooltip 
                                                            title={x.fileName}
                                                        >
                                                            {truncatedStr(x.fileName)}
                                                        </Tooltip>
                                                    </span>
                                                    <span 
                                                        className={styles.imageType}
                                                    >
                                                        {x.fileType}    
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }
                    </div>
                </span>
            }
        </div>
    )
}

export default MediaPage