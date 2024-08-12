class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // BUILD QUERY
    // 1A) Filtering
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'fields', 'sort', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    // const query = Tour.find(queryObj);
    this.query = this.query.find(JSON.parse(queryString));
    // let query = Tour.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitField() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    // page=2&limit=10, 1-10 page1, 11-20 page2
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
