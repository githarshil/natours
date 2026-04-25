class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const reqObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // remove special parameters by matching the key with the obj we don't want to use as filters
    excludedFields.forEach((el) => delete reqObj[el]);

    let querystr = JSON.stringify(reqObj);
    querystr = querystr.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    // convert filter operators back into an object
    const mongooseFilters = JSON.parse(querystr);
    this.query.find(mongooseFilters);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    if (this.queryString.page) {
      const numTours = Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('page doesnt exist');
      }
    }
    return this;
  }
}
module.exports = APIFeatures;
