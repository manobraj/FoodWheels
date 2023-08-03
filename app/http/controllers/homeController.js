const Menu = require('../../models/menu')

function homeController(){
    return {
      async index(req,res){
          // here we fetch all the databses from the mongodb and show to the real world like a website
          const pizzas = await Menu.find()
          // console.log(pizzas)
          return res.render('home',{pizzas:pizzas})
        }
    }
}

module.exports = homeController