const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');
const blogRouter = require('./routes/blog')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const tagRoutes = require('./routes/tag')
const formRoutes = require('./routes/form')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const PORT = process.env.PORT || 8000;
const app = express();
mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
}).catch(()=>{});

const Cat = mongoose.model('Cat', { name: String });

const kitty = new Cat({ name: 'Zildjian' });
kitty.save().then(() => {

});
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

if(process.env.NODE_ENV = 'development') {
    app.use(cors(process.env.CLIIENT_URL))
}
app.use('/api', blogRouter)
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', tagRoutes)
app.use('/api', formRoutes)

app.listen(PORT, () => {
})

