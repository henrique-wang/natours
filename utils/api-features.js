class APIFeatures {
    constructor(schema, queryString) {
        this.schema = schema;
        this.query = schema.find();
        this.queryString = queryString;
    }

    filter() {
        const queryObject = { ...this.queryString }; // Clone every property from req.query
        const excludedFields = ['page', 'size', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObject[el]);

        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            // .sort() accepts multiple params as 'param1 param2... paramN'
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limit() {
        if (this.queryString.fields) {
            // .select() accepts multiple params as 'param1 param2... paramN'
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    page() {
        const page = this.queryString.page * 1 || 1;
        const size = this.queryString.size * 1 || 100;
        const skip = (page - 1) * size;

        if (this.queryString.page) {
            this.schema.countDocuments().then((numDocuments) => {
                if (skip >= numDocuments) throw new Error('Page does not exist');
            });
        }

        this.query = this.query.skip(skip).limit(size);

        return this;
    }
}

module.exports = APIFeatures;