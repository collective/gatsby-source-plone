import React from 'react';

const NewsItem = ({data}) => (
    <div>
        <h3>{data.title}</h3>
        <em>{data.created}</em>
        <div>{data.description}</div>
    </div>
)

export default NewsItem;

export const newsItemFragment = graphql`
    fragment NewsItem on PloneNewsItem {
        id
        title
        description
        created
    }
`