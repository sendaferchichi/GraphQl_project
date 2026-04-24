```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

```graphql
query {
  getAllCvs {
    total
    hasMore
    items {
      id
      name
      job
      age
      owner { id name email role }
      skills { id designation }
    }
  }
}
```

```graphql
query ($id: ID!) {
  getCvById(id: $id) {
    id
    name
    owner { name }
    skills { designation }
  }
}
```

```graphql
query {
  page1: getAllCvs(skip: 0, take: 1) { total hasMore items { id name } }
  page2: getAllCvs(skip: 1, take: 1) { total hasMore items { id name } }
}
```

```graphql
query {
  getAllCvs(filter: { job: "Freelancer" }) {
    total
    items { id name job }
  }
}
```

```graphql
query {
  getAllCvs(filter: { name: "Frontend" }) {
    items { id name }
  }
}
```

```graphql
query ($skillId: ID!) {
  getAllCvs(filter: { skillId: $skillId }) {
    total
    items { id name skills { designation } }
  }
}
```

```graphql
query {
  getUsers {
    total
    items { id name email role cvs { id name } }
  }
}
```

```graphql
query {
  getUsers(filter: { role: ADMIN }) {
    items { id name email }
  }
}
```

```graphql
query ($id: ID!) {
  getUserById(id: $id) {
    id name email role
    cvs { id name job }
  }
}
```

```graphql
query {
  getSkills { id designation cvs { id name } }
}
```

```graphql
query ($id: ID!) {
  getSkillById(id: $id) { id designation }
}
```

```graphql
mutation {
  createUser(input: {
    name: "Tasnim"
    email: "tasnim@example.com"
    role: USER
  }) { id name email role }
}
```

```graphql
mutation {
  createSkill(input: { designation: "TypeScript" }) { id designation }
}
```

```graphql
mutation ($userId: ID!, $skillIds: [ID!]!) {
  createCv(input: {
    name: "Backend CV"
    age: 25
    job: "Backend Developer"
    userId: $userId
    skillIds: $skillIds
  }) {
    id name job
    owner { name }
    skills { designation }
  }
}
```

```graphql
mutation ($id: ID!) {
  updateCv(input: { id: $id, job: "Senior Backend" }) { id job }
}
```

```graphql
mutation ($id: ID!) {
  deleteCv(id: $id)
}
```

```graphql
mutation ($id: ID!) {
  updateUser(input: { id: $id, role: ADMIN }) { id name role }
}
```

```graphql
mutation ($id: ID!) {
  deleteUser(id: $id)
}
```

```graphql
mutation ($id: ID!) {
  updateSkill(input: { id: $id, designation: "Rust" }) { id designation }
}
```

```graphql
mutation ($id: ID!) {
  deleteSkill(id: $id)
}
```

```graphql
subscription {
  cvModified {
    mutation
    data { id name }
  }
}
```
