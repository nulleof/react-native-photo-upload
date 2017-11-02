import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'

export default class PhotoUpload extends React.Component {
  static propTypes = {
    containerStyle: PropTypes.object,
    title: PropTypes.string,
    cancelButtonTitle: PropTypes.string,
    takePhotoButtonTitle: PropTypes.string,
    chooseFromLibraryButtonTitle: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    format: PropTypes.string,
    quality: PropTypes.number,
    onPhotoSelect: PropTypes.func, // returns the base64 string of uploaded photo
    onStartOpening: PropTypes.func,
    onFinishOpening: PropTypes.func,
  }

  state = {
    height: this.props.height || 300,
    width: this.props.width || 300,
    format: this.props.format || 'JPEG',
    quality: this.props.quality || 80
  }

  options = {
    title: this.props.title || 'Select a Photo',
    cancelButtonTitle: this.props.cancelButtonTitle || 'Cancel',
    takePhotoButtonTitle: this.props.takePhotoButtonTitle || 'Take Photo…',
    chooseFromLibraryButtonTitle: this.props.chooseFromLibraryButtonTitle || 'Choose from Library…',
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  }

  openImagePicker = () => {
    // get image from image picker
    this.props.onStartOpening && this.props.onStartOpening();

    ImagePicker.showImagePicker(this.options, async response => {
      // console.log('Response = ', response)

      if (response.didCancel) {
        console.log('User cancelled image picker')
        this.props.onFinishOpening && this.props.onFinishOpening();
        return
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
        this.props.onFinishOpening && this.props.onFinishOpening();
        return
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
        this.props.onFinishOpening && this.props.onFinishOpening();
        return
      }

      let { height, width, quality, format } = this.state

      // resize image
      const resizedImageUri = await ImageResizer.createResizedImage(
        `data:image/jpeg;base64,${response.data}`,
        height,
        width,
        format,
        quality
      )
      const filePath = Platform.OS === 'android' && resizedImageUri.uri.replace
        ? resizedImageUri.uri.replace('file:/data', '/data')
        : resizedImageUri.uri

      // convert image back to base64 string
      const photoData = await RNFS.readFile(filePath, 'base64')
      let source = { uri: resizedImageUri.uri }

      // handle photo in props functions as data string
      if (this.props.onPhotoSelect) {
        this.props.onPhotoSelect(photoData, source)
      }

      this.props.onFinishOpening && this.props.onFinishOpening();
    })
  }

  render () {
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <TouchableOpacity onPress={this.openImagePicker}>
          {this.props.children}
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
