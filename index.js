/**
 * Illustrates use of mongodb client within a node.js app
 */

var MongoClient = require( 'mongodb' ).MongoClient;
var assert = require( 'assert' );

/**
 * Note: In all functions defined below, argument cb is a callback function - i.e. it gets called after the function completes it's operation
 */

// inserts documents passed to itself to db in collection specified by collectionString
var insertDocuments = function( db, collectionString, documents, cb ) {
	db.collection( collectionString ).insertMany(
		documents,
		function( err, result ) {
			assert.equal( err, null );
			assert.equal( result.result.n, 3 );
			assert.equal( result.ops.length, 3 );
			console.log( JSON.stringify( result, null, 4 ) );
			cb();
		}
	);
};

// fetches all documents matched by queryObj
var fetchDocuments = function( db, collectionString, queryObj, cb ) {
	db.collection( collectionString ).find( queryObj ).toArray(function( err, documents ) {
		assert.equal( err, null );
		cb( documents );
	});
};

// updates (atmost) one document (chosen based on queryObj)
var updateDocument = function( db, collectionString, queryObj, updateObj, cb ) {  
	db.collection( collectionString ).updateOne(
		queryObj,
		updateObj,
		function( err, result ) {
			assert.equal( err, null );
			assert.equal( result.result.n, 1 );
			cb( result );
		}
	);
};

var deleteDocument = function( db, collectionString, queryObj, cb ) {
	db.collection( collectionString ).deleteOne(
		queryObj,
		function( err, result ) {
			assert.equal( err, null );
			assert.equal( result.result.n, 1 );
			cb( result );
		}
	);
};

// string for mongodb client to establish connection with mongodb server
var connectionString = 'mongodb://localhost:27017/mongo-node-test-db';

var connection = MongoClient.connect( connectionString, function( err, db ) {
	assert.equal( err, null );
	console.log( 'Connected to mongodb server' );

	// Flow: Insert documents -> Fetch documents -> Update a document -> Delete a document 
	insertDocuments(
		db,
		'users',
		[
			{ name : 'john doe', password : 'john' },
			{ name : 'jane doe', password : 'jane' },
			{ name : 'jack doe', password : 'jack' }
		],
		function() {
			console.log( 'inserted 3 documents into users collection' );
			
			console.log( 'retrieving the documents in the users collection' );
			fetchDocuments( db, 'users', {}, function( documents ) {
				console.log( JSON.stringify( documents, null, 4 ) );

				console.log( 'Updating john\'s password' );
				updateDocument( db, 'users', { name : 'john doe' }, { $set : { password : 'johndoe' } }, function( result ) {
					console.log( 'result of update : ', JSON.stringify( result, null, 4 ) );
					
					deleteDocument( db, 'users', { name : 'jack doe' }, function( result  ) {
						console.log( 'deleted one document with name \'jack doe\'' );
						console.log( JSON.stringify( result, null, 4 ) );

						db.close();
					});
				});
			});
		}
	);
}); 
