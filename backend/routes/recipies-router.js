const express = require('express');
const sendErrorResponse = require('./utils').sendErrorResponse;
const replace_id = require('./utils').replace_id;
const ObjectID = require('mongodb').ObjectID;
const indicative = require('indicative');
const verifyToken = require('./verify-token');
const verifyRole = require('./verify-role');

const router = express.Router();

// recipies API Feature
router.get('/', async(req, res) => {
    try{
        const recipies = await req.app.locals.db.collection('recipies').find().toArray();
        res.json(recipies.map(p => replace_id(p)));
    } catch(err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});
router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const recipe = await req.app.locals.db.collection('recipies').findOne({ _id: new ObjectID(req.params.id) });
        if (!recipe) {
            sendErrorResponse(req, res, 404, `recipe with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(recipe);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid recipe data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.post('/', function(req, res) {
    const recipe = req.body;
    indicative.validator.validate(recipe, {
        title: 'required|string|min:3|max:80',
        authorId: 'required|regex:^[0-9a-f]{24}',
        shortDesc: 'string|max:256',
        timeToCook: 'required',
        products: 'array',
        'products.*': 'string',
        imageUrl: 'url',
        longDesc: 'string|max:2048',
        tags: 'array',
        'tags.*': 'string',
    }).then(() => {
        let date = Date.now();
        recipe.dateRegiter = date;
        recipe.lastModified = date;
        req.app.locals.db.collection('recipies').insertOne(recipe).then(r => {
            if (r.result.ok && r.insertedCount === 1) {
                replace_id(recipe);
                console.log(`Created recipe: ${recipe.id}: ${recipe.title}`);
                res.status(201).location(`/recipies/${recipe.id}`).json(recipe);
            } else {
                sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
            }
        }).catch(err => {
            console.error(`Unable to create recipe: ${recipe.id}: ${recipe.title}.`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
        });
    }).catch(errors => {
        sendErrorResponse(req, res, 400, `Invalid recipe data: ${errors.map(e => e.message).join(', ')}`, errors);
    });
});

router.put('/:id', verifyToken, verifyRole(['Author','Admin']), async (req, res) => {
    const old = await req.app.locals.db.collection('recipies').findOne({ _id: new ObjectID(req.params.id) });
    if (!old) {
        sendErrorResponse(req, res, 404, `recipe with ID=${req.params.id} does not exist`);
        return;
    }
    const recipe = req.body;
    if (old._id.toString() !== recipe.id) {
        sendErrorResponse(req, res, 400, `recipe ID=${recipe.id} does not match URL ID=${req.params.id}`);
        return;
    }
    try {
        await indicative.validator.validate(recipe, {
            id: 'required|regex:^[0-9a-f]{24}',
            title: 'required|string|min:3|max:80',
            authorId: 'required|regex:^[0-9a-f]{24}',
            shortDesc: 'string|max:256',
            timeToCook: 'required',
            products: 'array',
            'products.*': 'string',
            imageUrl: 'url',
            longDesc: 'string|max:2048',
            tags: 'array',
            'tags.*': 'string',
        });
        try {
            recipe.lastModified = Date.now();
            r = await req.app.locals.db.collection('recipies').updateOne({ _id: new ObjectID(req.params.id) }, { $set: recipe });
            if (r.result.ok) {
                console.log(`Updated recipe: ${JSON.stringify(recipe)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new recipies are the same.`);
                }
                res.json(recipe);
            } else {
                sendErrorResponse(req, res, 500, `Unable to update recipe: ${recipe.id}: ${recipe.title}`);
            }
        } catch (err) {
            console.log(`Unable to update recipe: ${recipe.id}: ${recipe.title}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid recipe data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await req.app.locals.db.collection('recipies').findOne({ _id: new ObjectID(req.params.id) });
        if (!old) {
            sendErrorResponse(req, res, 404, `recipe with ID=${req.params.id} does not exist`);
            return;
        }
        replace_id(old)
        const r = await req.app.locals.db.collection('recipies').deleteOne({ _id: new ObjectID(req.params.id) });
        if(r.result.ok && r.deletedCount === 1) {
            console.log(`Deleted recipe: ${old.id}: ${old.title}`);
            res.json(old);
        } else {
            console.log(`Unable to delete recipe: ${recipe.id}: ${recipe.title}`);
            sendErrorResponse(req, res, 500, `Unable to delete recipe: ${old.id}: ${old.title}`);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid recipe data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;