export default function reducer(state,action) {
    switch(action.type){
        case "LOGIN_USER":
            return{
                ...state,
                currentUser:action.payload
        }
        case "IS_LOGGED_IN":
            return{
                ...state,
                isAuth:action.payload
            }
        case "LOG_OUT_USER":
            return{
                ...state,
                currentUser:null,
                isAuth:false
        }
        case "CREATE_DRAFT":
            return{
                ...state,
                draft:{
                    latitude:0,
                    longitude:0
                },
                currentPin:null
            }
        case "UPDATE_DRAFT_LOCATION":
            return{
                ...state,
                draft:action.payload
            }
        case "DELETE_DRAFT":
            return{
                ...state,
                draft:null
            }
        case "GET_PINS":
            return {
                ...state,
                pins:action.payload
            }
        case "CREATE_PIN":
            const newPin = action.payload;
            const previousPins = state.pins.filter(pin =>(
                pin._id !== newPin._id
            ))
            return{
                ...state,
                pins: [...previousPins,newPin]
            }
            case "SET_PIN":
                return{
                    ...state,
                    currentPin:action.payload,
                    draft:null
                }
            case "DELETE_PIN":
                if(state.currentUser){
                    const isCurrentPin = action.payload._id === state.currentPin._id
                    if (isCurrentPin){
                        return{
                            ...state,
                            pins: state.pins.filter(pin => (
                                pin._id !== action.payload._id
                            )),
                            currentPin:null
                        }
                    }
                }
                return{
                    ...state,
                    pins: state.pins.filter(pin => (
                        pin._id !== action.payload._id
                    ))
                }
            case "ADD_COMMENT":
                const updatedCurrentPin = action.payload;
                // find and replace
                const updatedPins = state.pins.map(pin =>(
                    pin._id == updatedCurrentPin._id ? updatedCurrentPin : pin
                ))
                return{
                    ...state,
                    pins:updatedPins,
                    currentPin:updatedCurrentPin
                }
        default:
            return state;
    }
}