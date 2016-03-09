if (!global.hasOwnProperty('db')) {

  	var Sequelize = require('sequelize')
    , sequelize = null
    var URL = 'postgres://wjskmjpjhoarmq:Uiw1xyby9xL7I506NXdfNhHxF0@ec2-54-83-3-38.compute-1.amazonaws.com:5432/d98cjcg3qb9lcs';
	sequelize = new Sequelize(URL, {
		dialect:  'postgres',
		protocol: 'postgres',
		port:     5432,
		host:     'ec2-54-83-3-38.compute-1.amazonaws.com',
	    dialectOptions: {
	        ssl: true
	    }		
	});
	global.db = {
		Sequelize: Sequelize,
		sequelize: sequelize,
		User: sequelize.import(__dirname + '/user')
		// add your other models here
	};
}

module.exports = global.db