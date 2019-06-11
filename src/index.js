import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import {takeEvery, put} from 'redux-saga/effects';
import axios from 'axios';

function* rootSaga() {

    yield takeEvery('FETCH_SKETCHES', fetchSketches);
    yield takeEvery('ADD_SKETCH', addSketch);
}

const sagaMiddleware = createSagaMiddleware();

function* fetchSketches() {

    try{
        const response = yield axios.get('/api/sketches/all');
        // dispatch response to reducer
        yield put({type: 'SET_SKETCHES', payload: response.data});

    }
    catch(error) {
        console.log('error fetching sketches', error);
    }
}

function* addSketch(action) {

    try {
        yield axios.put('/api/sketches', action.payload);
        yield put({type: 'FETCH_SKETCHES'})
    }
    catch (error) {
        console.log('error adding new sketch to server', error);
    }

}


const sketches = (state = [], action) => {

    switch(action.type) {
        case 'SET_SKETCHES': return action.payload;

        default: return state;
    }
}


const store = createStore(
    combineReducers({ sketches }),
    applyMiddleware(sagaMiddleware),
);


  
//Pass rootSaga into our sagaMiddleware
sagaMiddleware.run(rootSaga);


ReactDOM.render(

    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root'));
