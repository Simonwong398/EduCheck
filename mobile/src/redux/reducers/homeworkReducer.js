const initialState = {
  homeworks: [],
  currentHomework: null,
  loading: false,
  error: null,
  analysisResult: null
};

const homeworkReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_HOMEWORKS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_HOMEWORKS_SUCCESS':
      return {
        ...state,
        homeworks: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_HOMEWORKS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'SET_CURRENT_HOMEWORK':
      return {
        ...state,
        currentHomework: action.payload
      };
    case 'ANALYZE_HOMEWORK_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
        analysisResult: null
      };
    case 'ANALYZE_HOMEWORK_SUCCESS':
      return {
        ...state,
        loading: false,
        analysisResult: action.payload,
        error: null
      };
    case 'ANALYZE_HOMEWORK_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        analysisResult: null
      };
    default:
      return state;
  }
};

export default homeworkReducer;
