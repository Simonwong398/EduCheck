import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// 导入reducers
import authReducer from './reducers/authReducer';
import homeworkReducer from './reducers/homeworkReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  homework: homeworkReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
