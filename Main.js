import React, { useState,useEffect, createContext } from 'react'
import { UseContext } from '../Contract/Context'
import {useHistory} from 'react-router-dom';

const Main = () => {
    const history = useHistory();
    const { web3, Contract } = UseContext()
    const [Accounts, setAccounts] = useState([])
    const [FIO, setFIO] = useState('')
    const [address, setAddress] = useState('')
    const [password, setPassword] = useState('')
    const [addressTo, setAddressTo] = useState();
    const [value, setValue] = useState();
    const [codeword, setCodeword] = useState();
    const [categoryId, setCategoryId] = useState();
    const [description, setDescription] = useState();
    const [transferId, setTransferId] = useState();
    const [balance, setBalance] = useState();
//-----------------------------------------------------------------------------
useEffect(() => {
    ListAccounts()
});

async function ListAccounts() {
    let Users = await web3.eth.getAccounts();
    Users[0] = "Выберите адрес:";
    setAccounts(Users);
}
//--------------регистрация--------------------------
async function signUp(e) {
    e.preventDefault();
    const address = await web3.eth.personal.newAccount(password);
    const accounts = await web3.eth.getAccounts();
    await web3.eth.personal.unlockAccount(accounts[0], "1");
    try {
        await Contract.methods.createUser(address, FIO).send({from: accounts[0]});
        await web3.eth.sendTransaction({
            from: accounts[0],
            to: address,
            value: 50*10**18
        });
        alert("Вы зарегистрировались, запомните ваш аккаунт:" + address);
    }
    catch(e) {
        alert(e);
    }
}
//---------------------Авторизация-------------------------------
async function logIn(e) {
    e.preventDefault();
    try {
        await web3.eth.personal.unlockAccount(address, password, 9999);
        web3.eth.defaultAccount = address;
        alert("Вы авторизовались.");
    }
    catch(e) {
        alert(e);
    }
}
//-------------------Создание перевода---------------------------
async function createTransfer(e) {
    e.preventDefault();
    try {
        await Contract.methods.createTransfer(addressTo, codeword, categoryId, description).send({from: address, value: value});
        const transferId = await Contract.methods.getTransferID().call();
        getBalance();
        alert("ID перевода: " + transferId);
    }
    catch(e) {
        alert(e);
    }
    e.target.reset();
}
//---------------------------------------------------------------
//---------------------Подтверждение перевода--------------------
async function confirmTransfer(e) {
    e.preventDefault();
    try {
        await Contract.methods.confirmTransfer(transferId, codeword).send({from: address});
        getBalance();
        alert("Перевод принят.");
    }
    catch(e) {
        alert(e);
    }
    e.target.reset();
}
//---------------------------------------------------------------
async function getBalance() {
    let balance = await Contract.methods.getBalance(address).call() / 10**18;
    setBalance(balance);
}
//-------------------Отмена перевода-----------------------------
async function cancelTransfer(e) {
    e.preventDefault();
    try {
        await Contract.methods.cancelTransfer(transferId).send({from: address});
        getBalance();
        alert("Перевод отменён.");
    }
    catch(e) {
        alert(e);
    }
    e.target.reset();
}
//--------------------------------------------------------------------
    return (
        <>
             <h4>Регистрация</h4>
        <form onSubmit={signUp}>
            <input required placeholder="Логин" onChange={(e)=>setFIO(e.target.value)}/><br/>
            <input required type="password" placeholder="Пароль" onChange={(e)=>setPassword(e.target.value)}/><br/>
            <button>Зарегистрироваться</button>
        </form><br/>

        <h4>Авторизация</h4>
        <form onSubmit={logIn}>
            <input required placeholder="Адрес" onChange={(e)=>setAddress(e.target.value)}/><br/>
            <input required type="password" placeholder="Пароль" onChange={(e)=>setPassword(e.target.value)}/><br/>
            <button>Войти</button>
        </form>

        Создать перевод
        <form onSubmit={createTransfer}>
            <input required placeholder="Адрес" onChange={(e)=>setAddressTo(e.target.value)}/><br/>
            <input required placeholder="Сумма" onChange={(e)=>setValue(e.target.value)}/><br/>
            <input required type="password" placeholder="Кодовое слово" onChange={(e)=>setCodeword(e.target.value)}/><br/>
            <input required placeholder="id категории" onChange={(e) => setCategoryId(e.target.value)} /><br />
            <input placeholder="Описание" onChange={(e)=>setDescription(e.target.value)}/><br/>
            <button>Отправить</button>
        </form><br/>

        Принять перевод
        <form onSubmit={confirmTransfer}>
            <input required placeholder="id перевода" onChange={(e)=>setTransferId(e.target.value)}/><br/>
            <input required type="password" placeholder="Кодовое слово" onChange={(e)=>setCodeword(e.target.value)}/><br/>
            <button>Принять</button>
        </form><br/>

        Отменить перевод
        <form onSubmit={cancelTransfer}>
            <input required placeholder="id перевода" onChange={(e)=>setTransferId(e.target.value)}/><br/>
            <button>Отменить</button>
        </form><br/>
        </>
    )
}
export default Main;
