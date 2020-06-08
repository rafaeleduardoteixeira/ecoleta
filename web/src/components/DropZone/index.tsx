import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import "./styles.css";

interface Props{
    onFileUploaded: (file:File) => void;
}

const DropZone:React.FC<Props> = (props) => {
  const [selectedImage, setSelectedImage] = useState("");
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const fileURL = URL.createObjectURL(file);
    setSelectedImage(fileURL);
    props.onFileUploaded(file);
  }, [props]);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} accept="image/*" />
      {selectedImage ? (
        <img src={selectedImage} alt="ponto de coleta" />
      ) : (
        <p>
          <FiUpload />
          Imagem do ponto de coleta
        </p>
      )}
    </div>
  );
};
export default DropZone;
