//IMP

//base - Product.find()

//bigQuery - ?search=word&page=2&category=shortsleeves&rating[gte]=4&
//           rating[lte]=5&price[gte]=199&price[lte]=999

class WhereClause {
  constructor(base, bigQuery) {
    this.base = base
    this.bigQuery = bigQuery
  }

  search() {
    const searchWord = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.search,
            $options: "i",
          },
        }
      : {}

    this.base = this.base.find({ ...searchWord })
    return this
  }

  filter() {
    const copyQ = { ...this.bigQuery }

    delete copyQ["search"]
    delete copyQ["limit"]
    delete copyQ["page"]

    //convert big query into string
    let stringOfCopyQ = JSON.stringify(copyQ)

    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    )

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ)
    this.base = this.base.find(jsonOfCopyQ)
    return this
  }

  pager(resultsPerPage) {
    let pageNo = 1
    if (this.bigQuery.page) {
      pageNo = this.bigQuery.page
    }

    const skipValue = resultsPerPage * (pageNo - 1)
    this.base = this.base.limit(resultsPerPage).skip(skipValue)
    return this
  }
}

module.exports = WhereClause