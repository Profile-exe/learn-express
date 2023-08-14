const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    password: String
    status: String!
    posts: [Post!]!
  }

  type AuthData {
    token: String!    # JWT token
    userId: String!
  }

  type PostData {
    posts: [Post!]!
    totalPosts: Int!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  input loginInputData {
    email: String!
    password: String!
  }

  type RootQuery {
    login(loginInput: loginInputData): AuthData!
    signup(userInput: UserInputData): AuthData!
    posts(page: Int!): PostData!
    post(id: ID!): Post!
    user: User!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
    updatePost(id: ID!, postInput: PostInputData): Post!
    deletePost(id: ID!): Post!
    updateStatus(status: String!): User!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
