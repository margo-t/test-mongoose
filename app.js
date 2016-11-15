var SERVER_NAME = 'patient-api'
var DEFAULT_PORT = 5000
var DEFAULT_HOST = '127.0.0.1'
//
// Preamble
var http = require ('http');	     // For serving a basic web page.
var mongoose = require ("mongoose"); // The reason for this demo.

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
  //process.env.MONGODB_URI ||
  'mongodb://admin:admin@ds147167.mlab.com:47167/heroku_f55jkc5j';
  mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + uristring);
  }
});


// The http server will listen to an appropriate port, or default to
// port 5000
var ipaddress = process.env.IP; // TODO: figure out which IP to use for the heroku
var port = System.getenv("PORT");

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
var patientSchema = new mongoose.Schema({
    firstName: String,
		lastName: String,
    gender: String,
    cellPhoneNumber: String,
    healthInsuranceNumber: String,
		address: String,
		dateOfBirth: String,
		department: String,
		doctor: String
});

var recordSchema = new mongoose.Schema({
		date: String,
		doctorId: String,
		tempreture: String,
		bloodPressure: String,
		respiration: String,
		heartBeat: String,
    bloodOxygen: String,
    allergies: String,
    nausea: String,
    appetite: String,
    painArea: String,
    painLevel: String,
    medications: String,
    visitReason: String,
    healthBackground: String,
    emergencyLevel: String,
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patients' collection in the MongoDB database
var Patient = mongoose.model('Patient', patientSchema);
var Record = mongoose.model('Record', recordSchema);

var restify = require('restify')
  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

	if (typeof ipaddress === "undefined") {
		//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
		//  allows us to run/test the app locally.
		console.warn('No process.env.IP var, using default: ' + DEFAULT_HOST);
		ipaddress = DEFAULT_HOST;
	};

	if (typeof port === "undefined") {
		console.warn('No process.env.PORT var, using default port: ' + DEFAULT_PORT);
		port = DEFAULT_PORT;
	};


  server.listen(port, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('Endpoints:');

  console.log('%s/patients method: POST', server.url);
  console.log('%s/patients method: GET', server.url);
  console.log('%s/patients/:id method: GET', server.url);
  console.log('%s/patients/hi/:healthInsuranceNumber method: GET', server.url);

  console.log('%s/patients/:id/records method: POST', server.url);
  console.log('%s/patients/:id/records method: GET', server.url);
  console.log('%s/patients/:id/records/:id method: GET', server.url);



})


  server
    // Allow the use of POST
    .use(restify.fullResponse())

    // Maps req.body to req.params so there is no switching between them
    .use(restify.bodyParser())

    //POST
    // Create a new patient
    server.post('/patients', function (req, res, next) {
      console.log("**                                   **");
      console.log('Processed Request --> POST request: patients');
      // Make sure name is defined
      if (req.params.firstName === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new restify.InvalidArgumentError('first_name must be supplied'))
      }
      if (req.params.lastName === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new restify.InvalidArgumentError('last_name must be supplied'))
      }

      // Creating new patient.
      var newPatient = new Patient({
        firstName: req.params.firstName,
        lastName: req.params.lastName,
        gender: req.params.gender,
        cellPhoneNumber: req.params.cellPhoneNumber,
        healthInsuranceNumber: req.params.healthInsuranceNumber,
        address: req.params.address,
        dateOfBirth: req.params.dateOfBirth,
        department: req.params.department,
        doctor: req.params.doctor
      });


      // Create the patient and saving to db
      newPatient.save(function (error, result) {

        // If there are any errors, pass them to next in the correct format
        if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

        // Send the patient if no issues
        res.send(201, result)
      })
    })

    //GET
    // Get all patients in the system
    server.get('/patients', function (req, res, next) {
      console.log('GET request: patients');
      // Find every entity within the given collection
      Patient.find({}).exec(function (error, result) {
        if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
        res.send(result);
      });
    })


    // Get a single patient by their patient id
    server.get('/patients/:id', function (req, res, next) {
      console.log("**                                   **");
      console.log('Processed Request --> GET request: patients/' + req.params.id);

      // Find a single patient by their id
      Patient.find({ _id: req.params.id }).exec(function (error, patient) {
        // If there are any errors, pass them to next in the correct format
        //if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

        if (patient) {
          // Send the patient if no issues
          res.send(patient)
        } else {
          // Send 404 header if the patient doesn't exist
          res.send(404)
        }
      })
    })


// Get a single patient by their patient healthInsurance_number
server.get('/patients/hi/:healthInsuranceNumber', function (req, res, next) {
  console.log("**                                   **");
  console.log('Processed Request --> GET request: patients/hi/' + req.params.healthInsuranceNumber);

  // Find a single patient by their id
  Patient.find({healthInsuranceNumber: req.params.healthInsuranceNumber }).exec(function (error, result) {
    // If there are any errors, pass them to next in the correct format
    //if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
      res.send(result);
  })

})

//POST - RECORDS
// Create a new record
server.post('/patients/:id/records', function (req, res, next) {

    console.log("**                                   **");
    console.log("Processed Request --> Create new record");
  // Make sure fields are defined
  if (req.params.date === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('date must be supplied'))
  }
  if (req.params.doctorId === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('doctorId must be supplied'))
  }

  var newrecord = new Record ({
		date: req.params.date,
		doctorId: req.params.doctorId,
		tempreture: req.params.tempreture,
		bloodPressure: req.params.bloodPressure,
		respiration: req.params.respiration,
		heartBeat: req.params.heartBeat,
		bloodOxygen: req.params.bloodOxygen,
		allergies: req.params.allergies,
		urine: req.params.urine,
		nausea: req.params.nausea,
		appetite: req.params.Appetite,
		painArea: req.params.PainArea,
		painLevel: req.params.PainLevel,
		medications: req.params.Medications,
		visitReason: req.params.visitReason,
		healthBackground: req.params.healthBackground,
		emergencyLevel: req.params.emergencyLevel,
	});

  // Create the new record using the persistence engine
  newrecord.save(function (error, result) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    // Send the patient if no issues
    res.send(201, result)
    })
    })

// Get all records in the system of a patient
  server.get('/patients/:id/records', function (req, res, next) {

    console.log("**                                   **");
    console.log("Processed Request --> Get all records of patient");

    // Find every entity within the given collection
    Record.find({}).exec(function (error, result)
    {
      if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
      res.send(result);
  });
})


// Get a single record by their patient id
server.get('/patients/:id/records/:id', function (req, res, next) {

  console.log("**                               **");
  console.log("Processed Request --> Get by record id");
  // Find a single patient by their id within save
  Record.find({ _id: req.params.id }).exec(function (error, result) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
      res.send(result);
    });
})
