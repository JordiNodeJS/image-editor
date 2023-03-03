import { useEffect } from 'react'
import 'two-up-element'
import { useDropzone } from 'react-dropzone'
import {
  AdvancedImage,
  lazyload,
  accessibility,
  responsive,
  placeholder
} from '@cloudinary/react'
import Spinner from './Spinner'
import {
  cld,
  imgOriginal,
  imgBackground,
  imgReadyToDownload
} from '../utils/transformations'
import { useMyContext } from '../store/context'
import { Actions } from '../store/reducer'
import TwoUp from './TwoUp'

const CloudinaryUpload = () => {
  const { state, dispatch } = useMyContext()
  const { publicId, isUpLoading } = state

  useEffect(() => {
    dispatch({ type: Actions.SET_PUBLIC_ID, payload: { publicId: null } })
    dispatch({
      type: Actions.SET_IS_UPLOADING,
      payload: { isUpLoading: false }
    })
  }, [])

  const handleDrop = async acceptedFiles => {
    dispatch({ type: Actions.SET_IS_UPLOADING, payload: { isUpLoading: true } })
    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET)
    formData.append('timestamp', Date.now() / 1000)
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          cld.getConfig().cloud.cloudName
        }/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      const data = await response.json()
      dispatch({
        type: Actions.SET_CLOUDINARY_IMG,
        payload: { cldImage: data }
      })

      dispatch({
        type: Actions.SET_PUBLIC_ID,
        payload: { publicId: data.public_id }
      })
      dispatch({
        type: Actions.SET_IS_UPLOADING,
        payload: { isUpLoading: false }
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: false,
    maxFiles: 1,
    accept: { 'image/*': [] },
    onDrop: handleDrop
  })

  return (
    <div className="flex w-full flex-col items-center justify-center bg-pink-50 p-4 shadow-lg shadow-gray-200">
      <div
        {...getRootProps({
          className: `flex flex-col w-full items-center justify-center border-2 border-dashed border-violet-200 p-4 mb-4 ${
            isDragActive && 'bg-cyan-100'
          }`
        })}
      >
        <input {...getInputProps()} />
        {isUpLoading && (
          <div className="mb-3 flex items-center">
            <Spinner />
            Preparing your photo
          </div>
        )}
        <button className="btn-primary btn mb-4" type="button">
          Upload Image
        </button>
        <p>Drag and Drop an Image.</p>
      </div>
      <TwoUp />
      {publicId && (
        <a
          className="btn-secondary btn mt-4"
          download
          href={imgReadyToDownload(publicId)}
          target="_blank"
          rel="noreferrer"
        >
          download
        </a>
      )}
    </div>
  )
}

export default CloudinaryUpload
