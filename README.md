# mazes

Can I draw a maze I cannot escape from?

## Overview of maths & algorithms

For generating mazes: variation of randomized depth first and breath first
search.

The 'planar' ones create a graph of pointers and search that graph for unvisited
nodes. Some later mazes don't construct that graph, by relying on triangle
groups, or in case of the last few spirals, just computing relative coordinates
directly.

For mazes on the hyperbolic plane: hyperbolic trigonimetry of course.

Spiral mazes: ordinary trigonometry.
