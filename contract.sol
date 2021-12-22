pragma solidity >0.7.0;

contract Perevodi{

    //структура Пользователь
    struct User{
        string login;
        string password;
        uint balance;
        bool role;
    }
    mapping(address=>User)public users;
    address[] public userlist;

    //структура Перевод
    struct Transfer {
        address fromAddress;
        address toAddress;
        uint value;
        bytes32 codewordHash;
        uint categoryId;
        string description;
        uint time;
        bool status;
    }
    uint public transfer_amount;
    string[] public categories;

    struct Template{
        uint value;
        uint category;
    }
    mapping(string=>Template)public templates;
    string[] public template_names;
    uint public admin_amount;

    constructor(){

        //пользователи
        users[0x114ce064340e08F04C22dD3fBc79459498fC65A3]=User("1","123",1000,false);
        users[0x0bdF67daE811783dc27C04A43666dE454cb83d8D]=User("2","123",1000,false);
        users[0x4df3826a2616032985fE1B5C470963d9AA79950C]=User("3","123",1000,false);
        users[0x260d7542Ff3f0e72Cbf7a68d0aff768E16c4C5F7]=User("4","123",1000,false);

        //администраторы
        users[0x1CaeF5108Fecd8834b81000224540332D93D4f00]=User("5","123",1000,true);
        users[0xc7356631b15deceB72e75E58Edd834433AD1035c]=User("6","123",1000,true);

        //список пользователей
        userlist.push(0x114ce064340e08F04C22dD3fBc79459498fC65A3);
        userlist.push(0x0bdF67daE811783dc27C04A43666dE454cb83d8D);
        userlist.push(0x4df3826a2616032985fE1B5C470963d9AA79950C);
        userlist.push(0x260d7542Ff3f0e72Cbf7a68d0aff768E16c4C5F7);
        userlist.push(0x1CaeF5108Fecd8834b81000224540332D93D4f00);
        userlist.push(0xc7356631b15deceB72e75E58Edd834433AD1035c);

        //кол-во администраторов
        admin_amount = 2;

        //категории
        categories.push("0 -");
        categories.push("2 -");
        categories.push("3 -");

        //шаблоны
        templates["Podarok 10"]=Template(0,10);
        templates["Podarok 30"]=Template(0,30);
        templates["Podarok 50"]=Template(0,50);
        templates["Kvartplata 70"]=Template(1,70);
        templates["Kvartplata 90"]=Template(2,90);
        templates["Pogashenie zadolzhennosti 100"]=Template(3,100);

        //наименование существующих шаблонов
        template_names=["Podarok 10","Podarok 30","Podarok 50","Kvartplata 70","Kvartplata 90","Pogashenie zadolzhennosti 100"];
    }

    //функция создания нового пользователя
    function create_user(string memory login,string memory password)public{
        users[msg.sender]=User(login,password,0,false);
        userlist.push(msg.sender);
    }
    function get_userlist()view public returns(address[] memory){
        return userlist;
    }
    function get_user_amount()view public returns(uint){
        return userlist.length;
    }

    Transfer[] public transfers;

    //функция получения айди трансфера
    function getTransferID() public view returns(uint) {
    //return transfers.length-=1;
    }

    //функция получения хэша
    function getHash(string memory str) public pure returns(bytes32) {
        return keccak256(bytes(str));
    }
    //функция подтверждения перевода
    function createTransfer(address toAddress, string memory codeword, uint categoryId, string memory description) public payable {
        require(msg.value > 0, "Invalid value");
        require(msg.sender != toAddress, "You can't transfer to yourself");
        require(getHash(users[toAddress].login) != getHash(""), "Account not registered");
        require(getHash(categories[categoryId]) != getHash(""), "Category doesn't exist");
        transfers.push(Transfer(msg.sender, toAddress, msg.value, getHash(codeword), categoryId, description, 0, true));
    }
    
    //функция подтверждения перевода
    function confirmTransfer(uint transferId, string memory codeword) public payable {
        require(transferId < transfers.length, "Invalid id");
        require(transfers[transferId].status, "Transfer is not active");
        require(msg.sender == transfers[transferId].toAddress, "Not for you");
        if (transfers[transferId].codewordHash == getHash(codeword)) {
            payable(msg.sender).transfer(transfers[transferId].value);
            transfers[transferId].time = block.timestamp;
        }
        else {
            payable(transfers[transferId].fromAddress).transfer(transfers[transferId].value);
        }
        transfers[transferId].status = false;
    }
    
    //функция отмены перевода
    function cancelTransfer(uint transferId) public payable {
        require(transferId < transfers.length, "Invalid id");
        require(transfers[transferId].status, "Transfer is not active");
        require(msg.sender == transfers[transferId].fromAddress, "Not for you");
        payable(msg.sender).transfer(transfers[transferId].value);
        transfers[transferId].status = false;
    }

   //функция создания категории
   function create_category(string memory name)public{
       categories.push(name);
   }

   //получить список существующих категорий
   function get_categories()public view returns(string[] memory){
       return categories;
   }

   //функция создания шаблона
   function create_template(string memory name,uint category,uint value)public onlyAdmin{
       templates[name]=Template(category,value);
       template_names.push(name);
   }
   function get_templates_list()public view returns(string[] memory){
       return template_names;
   }

   //модификатор администратора
   modifier onlyAdmin(){
       require(users[msg.sender].role==true,"error:you are not admin");
       _;
   }
}
