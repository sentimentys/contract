import React,{useState} from 'react'

import Web3 from 'web3'

import {BrowserRouter as Router} from 'react-router-dom'

//Файлы экспортируемые

import {UserList} from './Contract/UserList'

import {Context} from './Contract/Context'

import Routers from './router'

const App=()=>{

const [web3] =useState(new Web3('http://127.0.0.1:8545'));

const AddressContract='0x1660288f5ca761087f62ac8dd1d7e9eae411283a' //Адрес контракта

const [Contract] = useState(new web3.eth.Contract(UserList,AddressContract))

web3.eth.defaultAccount='0x0000000000000000000000000000000000000000'


return(

<Router>

<Context.Provider value={{web3,Contract}}>

<Routers/>

</Context.Provider>

</Router>

)

}

export default App
