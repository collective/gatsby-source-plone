import React from 'react'
import Link from 'gatsby-link'

const IndexPage = ({ data }) => (
  <div>
    {data.allDocument.edges.map(({ node }) => (
      <div>
        <h3>{node.title}</h3>
        <h4>{node.description}</h4>
      </div>
    ))}
  </div>
)

export default IndexPage

// Set here the ID of the home page.
export const pageQuery = graphql`
query IndexPageQuery {
    allDocument {
      edges {
        node {
          id
          title
        }
      }
    }
}
`
