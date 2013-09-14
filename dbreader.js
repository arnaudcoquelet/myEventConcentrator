var mongojs = require('mongojs');
var db = mongojs('mydb', ['events']);


db.events.find().sort( {'creation_date':1},
            function(err, docs) {
                if( err || !docs) {
                  console.log("No event found"); 
                  db.close();
                  return;
                }
                else {
                  docs.forEach( function(eventData) {
                    console.log(eventData);
                  });

                  db.close();
                }
} );


/*
jb.find("event", {}, {"$orderby" : {"creation_date" : 1}},
            function(err, cursor, count) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Found " + count + " events");
                while (cursor.next()) {
                    console.log(cursor.field("id") + " - " + cursor.field("from") + " to " + cursor.field("to") + " msg:" + cursor.field("msg"));
                }
                cursor.close(); //It's not mandatory to close cursor explicitly
                jb.close(); //Close database
            });*/