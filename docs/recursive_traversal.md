# Traversal using recursion

In the method using `@search` endpoint for traversal, it's required to first create an array of items, and then data of each item is fetched and further processed step by step to an array of nodes. For small list of items, this may seem efficient or when using [search parameters](https://plonerestapi.readthedocs.io/en/latest/searching.html#search).

So what's preferred in the normal scenario is recursively going through each node's children for traversal. A [Breadth-First Search](https://en.wikipedia.org/wiki/Breadth-first_search) (BFS) was implemented to efficiently traverse through nodes and process them directly.

A basic implementation of the algorithm in JavaScript can be seen below, (as per this [answer](https://stackoverflow.com/a/33704700/9779563) on Stack Overflow) :

```javascript
Tree.prototype.traverse = function(callback) {
  var queue = [this];
  var n;

  while (queue.length > 0) {
    n = queue.shift();
    callback(n.value);

    if (!n.children) {
      continue;
    }

    for (var i = 0; i < n.children.length; i++) {
      queue.push(n.children[i]);
    }
  }
};
```

This was used as the reference, and the basic idea of the BFS algorithm was followed, ie, using the queue data structure to start with the first item, and then consecutively store the children of each processed item, while processing the dequeued element in each iteration of the loop.

## Handling Collections

Collections are data types that are basically a group of content objects returned which a certain search query is run. This means they have children that are originally children of other nodes, which means there isn't a need for them to be traversed again.

The algorithm was modified to handle this condition as well using a `seen[path]` approach, in which an object `seen` has a list of all paths that's been traversed already saved as `seen[path] = true`.

Furthermore, it was noted that often, when content objects have a huge list of children, they too, are batched like the `@search` response, and so all content objects have batching support added.
