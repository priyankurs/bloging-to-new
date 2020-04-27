import express from "express"
import bodyParser from "body-parser"
import {
	MongoClient
} from "mongodb"
import path from 'path'

const app = express()
app.use(bodyParser.json())
app.use(express.static(path.join( __dirname, '/build')));

const withDB = async (operations, res) => {
	try {


		const client = await MongoClient.connect('mongodb://localhost:27017', ({
			useNewUrlParser: true
		}))
		const db = client.db('my-blog')

		await operations(db)

		client.close()

	} catch (error) {
		res.status(500).json({
			message: 'error message',
			error: error
		})
	}

}


app.get('/api/article/:name', async (req, res) => {

	withDB(async (db) => {
		const articleName = req.params.name
		const articleInfo = await db.collection('articles').findOne({
			name: articleName
		})
		res.status(200).json(articleInfo);

	}, res)
})

app.post('/api/article/:name/upvote', async (req, res) => {

	withDB(async (db) => {
		const articleName = req.params.name
		const articleInfo = await db.collection('articles').findOne({
			name: articleName
		})
		await db.collection('articles').updateOne({
			name: articleName
		}, {
			'$set': {
				upvote: articleInfo.upvote + 1,
			},
		})
		const articleSecondInfo = await db.collection('articles').findOne({
			name: articleName
		})
		res.status(200).json(articleSecondInfo);
	}, res)
})

app.post('/api/article/:name/comment', (req, res) => {
	withDB(async (db) => {
		const articleName = req.params.name
		const articleInfo = await db.collection('articles').findOne({
			name: articleName
		})
		const {
			user,
			comment
		} = req.body
		await db.collection('articles').updateOne({
			name: articleName
		}, {
			'$set': {
				comments: articleInfo.comments.concat({
					user,
					comment
				}),
			},
		})
		const articleSecondInfo = await db.collection('articles').findOne({
			name: articleName
		})


		res.status(200).json(articleSecondInfo)
	}, res)

})
	app.get('*', (req, res) =>{
		res,sendFile(path.join( __dirname + '/build/index.html'));
	})

app.listen(5000, () => {
	console.log("here we go")
})