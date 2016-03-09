module.exports = function(sequelize, Sequelize) {
  return sequelize.define("User", {
    username: {type: Sequelize.STRING, unique: true},
    password: {type: Sequelize.STRING},
    position: {type: Sequelize.JSON, defaultValue: {'x':0, 'y':0, 'z': 0} },
    model_name: {type: Sequelize.STRING, defaultValue:'my_cube'},
    
  })
}