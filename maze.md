# Maze

## 2022-02-06

Problem: even if you close http-server, sometimes the fucker
decides to just keep running, because how the fuck else could it
do harm?

## 2022-01-20

I want to build mazed build on tilings now, which still is tough.


Idea: compute the true scale polar coordinates using hyperbolic 
trigonometry, then adjust the radius for the disc.

Keep parallel transport in mind! I.e. there is no unique
parallel to the theta = 0 line, so perhaps it is better to
consider angles from radii.

### lengths

Apparently I needed to take the square root of the metric to
get the length right. Fine, the mazes finally look good.

## 2022-01-16

The hyperbolic spiral mazes remain a challenge. I guess I keep messing
things up.

In the hyperbolic plane, each cell added to the maze adds a
roughly constant amount of area, which is why area is the
unit of account thoughout.

- the radius we compute from the area is the raidus in the poincarĂ© disc.
- rho of that is the true length

## 2022-01-15

`A / (1 + r)^2 + B / (1 + r) + C / (1 - r) + D / (1 - r)^2 = `
`A (1 - 2 r + r r) + B (1 - r - r r + r r r) + C (1 + r - r r - r r r) + D (1 + 2 r + r r) = ` 
`(A + B + C + D) + (-2 A - B + C + 2 D) r + (A - B - C + D) r r + (B - C) r r r`

`r_0 = (1, 1, 1, 1) / 4`
`r_1 = (-1, 0, 0, 1) / 4`
`r_2 = (1, -1, -1, 1) / 4`
`r_3 = (-1, 2, -2, 1) / 4`

## 2022-01-10

What about mazes based on tiling of the poincarĂ© disc?



