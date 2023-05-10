handler = async function(event, context) {
   
   var mysql = require('mysql');

   const connection = mysql.createConnection ({
      host: 'localhost',
      user: 'root',
      password: 'meteoro1234',
      database: 'meteoro',
      port: 3306,
      synchronize: true
   });
   connection.connect(function(error, res){
      if(error){
         console.log('******Error Conexion', error);
      }else{
         console.log('Conexion correcta.');
      }
   });

   const {email, sub} = event.request.userAttributes;
   console.log(email, typeof(email));
   console.log(sub, typeof(sub));
   connection.query(
      'INSERT INTO users(email, password) VALUES(?, ?)', 
      [`${email}`, `${sub}`], function(error, res) {
      if(error){
         console.log('******Error Insercion', error);
      } else {
         console.log('******Insercion correcta.');
      }
    }
   ); 
   connection.end();
   
   return event;
};

handler({
   request: {
     userAttributes: {
       email: "ricardovelecal@gmail.com",
       sub: "Password123@"
     }
   },
 }
)