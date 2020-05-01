import React,{useState, useContext} from "react";
import axios from 'axios'
import Context from '../../context'
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";
import {GraphQLClient} from 'graphql-request'
import {CREATE_PIN_MUTATION} from '../../graphql/mutations'
import {useClient} from '../../client'

const CreatePin = ({ classes }) => {
  const client = useClient()
  const [title,setTitle] = useState('')
  const [image, setImage] = useState('')
  const [content, setContent] = useState('')
  const [isFired, setIsFired] = useState(false)

  const {state,dispatch} = useContext(Context)

  const handleDeleteDraft = () => {
      setTitle('')
      setImage('')
      setContent('')
      dispatch({type:'DELETE_DRAFT'})
  }

  const handleImageUpload = async () =>{
    const data = new FormData();
    data.append("file", image)
    data.append("upload_preset","q67arr6h")
    data.append("cloud_name","dzdvrgbjd")
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dzdvrgbjd/image/upload",
      data
    )
    return res.data.url
  }

  const handleSubmit = async e =>{
    e.preventDefault();
    try{
    setIsFired(true)
    const url = await handleImageUpload()
    const variables = {
        title,
        image:url,
        content,
        latitude:state.draft.latitude,
        longitude:state.draft.longitude
    }
    const {createPin} = await client.request(CREATE_PIN_MUTATION,variables);
    console.log({createPin})
    dispatch({type:"CREATE_PIN",payload:createPin})
    handleDeleteDraft()
  } catch(err){
    setIsFired(false)
    console.error("failed to submit " + err)
  }
  }
  return (
    <form className={classes.form}>
      <Typography
        className={classes.alignCenter}
        component="h2"
        variant="h4"
        color="secondary"
      >
        <LandscapeIcon className={classes.iconLarge} />
        Pin Location
      </Typography>
      <div>
        <TextField 
          name='title'
          label='Title'
          placeholder='Insert Pin Title Here'
          onChange={e => setTitle(e.target.value)}
        />
        <input 
          accept="image/*"
          id="image"
          type="file"
          className={classes.input}
          onChange={e => setImage(e.target.files[0])}
          />
          <label htmlFor="image">
            <Button
              style={{color:image && "green"}}
              component="span"
              size="small"
              className={classes.button}>
                <AddAPhotoIcon />
            </Button>
          </label>
      </div>
      <div className={classes.contentField}>
          <TextField
            name="content"
            label="content"
            multiline
            rows="6"
            margin="normal"
            fullWidth
            variant="outlined"
            onChange={e => setContent(e.target.value)}
            />
      </div>
      <div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={handleDeleteDraft}
        >
            <ClearIcon className={classes.leftIcon} />
            Discard
        </Button>
        <Button
          type="submit"
          className={classes.button}
          variant="contained"
          color="secondary"
          disabled={!title.trim() || !content || !image || isFired}
          onClick={handleSubmit}
        >
            <SaveIcon className={classes.rightsIcon} />
            Submit
        </Button>
      </div>
    </form>
  )
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);
