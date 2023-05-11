const AppError = require('../error/app-error');

/**
 * 
 * @param {*} mongoose.model Model 
 */
const deleteOne = Model => async (req, res, next) => {
    const documentId = req.params.id;
    try {
        const deletedDocument = await Model.findByIdAndDelete(documentId);
        res.status(204).json({
            status: 'success',
            data: {
                data: deletedDocument
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 
 * @param {*} mongoose.model Model 
 */
const getOne = (Model, populateQuery) => async (req, res, next) => {
    const documentId = req.params.id;
    let document;

    try {
        if (populateQuery) {
            document = await Model.findById(documentId).populate(populateQuery);
        } else {
            document = await Model.findById(documentId);
        }

        if (document) {
            res.status(200).json({
                status: 'success',
                data: {
                    data: document
                }
            })
        } else {
            next(new AppError(`Document ${documentId} not found.`, 404));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * 
 * @param {*} mongoose.model Model 
 */
const createOne = Model => async (req, res, next) => {
    try {
        const newDocument = await Model.create(req.body);

        res.status(201).json(
            {
                status: 'success',
                data: {
                    data: newDocument
                }
            }
        )
    } catch (error) {
        next(error);
    }
};

/**
 * 
 * @param {*} mongoose.model Model 
 */
const updateOne = Model => async (req, res, next) => {
    const documentId = req.params.id;

    try {
        const updatedDocument = await Model.findByIdAndUpdate(documentId, req.body, { new: true, runValidators: true });
        res.status(200).json({
            status: 'success',
            data: {
                data: updatedDocument
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    deleteOne,
    getOne,
    createOne,
    updateOne
}