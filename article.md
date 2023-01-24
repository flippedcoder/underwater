# Build a Full-stack App with Next

### Introduction

[Next](https://nextjs.org/) is quickly becoming one of the go-to JavaScript frameworks for developing production apps. One of it's biggest benefits is how it offers static and server side rendering on top of React, which increases the performance of your apps. It also offers API routing which lets you build your APIs within the framework. This can be helpful if you want to include your back-end code with your front-end code or you want to make a proxy to call other APIs.

In this tutorial, you will build a full-stack app using Next. You'll learn how you can build your React app with this framework and how you can implement APIs to act as a proxy. The app you'll build is a page that will let you look up details about different fish.

## Prerequisites

To follow along and build this app, you'll need the following:

- Node 14.6.0 or newer. This tutorial will use Node 19.3.0. You can learn how to install Node with our [How to Install Node.js and Create a Local Development Environment on macOS](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-and-create-a-local-development-environment-on-macos) tutorial.
- Knowledge of React fundamentals. If you need a refresher, check out [some of our React topics](https://www.digitalocean.com/community/tutorials?q=%5BReact%5D).
- Knowledge of building APIs with JavaScript. Take a look at this [](https://www.digitalocean.com/community/tutorials/how-to-build-a-hello-world-application-with-koa) tutorial to see a quick example.

## Step 1: Bootstraping the Next app with TypeScript

You'll start by creating a new Next app in your terminal. This tutorial is using Next 13.1.1. Since this is a new app, you can go ahead and include TypeScript by default so that you have typing available as you build the app. Open a terminal on your computer and run this command.

```command
npx create-next-app@latest --ts
```

You'll see a prompt like this in your terminal. We've named this project `underwater`, but feel free to call it what you like.

```
[secondary_label Output]
? What is your project named? › <^>underwater<^>
```

Next, you'll be asked if you want to include [ESLint](https://eslint.org/) in the project. Having a linter in your project is always a great idea. For this tutorial, we'll say **Yes** to this prompt.

```
[secondary_label Output]
? Would you like to use ESLint with this project? › No / Yes
```

Lastly, your Next app will be created and you'll see this output in your terminal.

```
[secondary_label Output]
Creating a new Next.js app in /Users/user/Repos/underwater.

Using npm.

Installing dependencies:
- react
- react-dom
- next
- @next/font
- typescript
- @types/react
- @types/node
- @types/react-dom
- eslint
- eslint-config-next


added 261 packages, and audited 262 packages in 9s

94 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Initializing project with template: default 

Success! Created underwater at /Users/user/Repos/underwater
```

This new Next app has everything you need to run it immediately. Run the following commands to go to your project directory and start the app. You'll see the output below after the app starts.

```command
cd underwater
npm run dev
```

```
[secondary_label Output]
> underwater@0.1.0 dev
> next dev

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully in 831 ms (166 modules)
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

wait  - compiling / (client and server)...
event - compiled client and server successfully in 474 ms (195 modules)
```

When you go to <http://localhost:3000>, you should see this page.

![Next app boilerplate home page](next_boilerplate_home.png)

### Installing the required packages

Now you'll install all of the packages your project needs. This tutorial is going to use [Material UI](https://mui.com/) as the component library. Here's the command to install this.

```command
npm install @mui/material @emotion/react @emotion/styled
```

## Step 3: Creating the back-end

Let's dive into making the API route that will act as a proxy for the [FishWatch.gov Species Content API](https://www.fishwatch.gov/developers) you'll use to get fish facts. We'll make an endpoint to retrieve the fish facts from FishWatch.

### The fish details

Now let's make the endpoint that gives the details for a specific fish species. Create a new file called `fish.ts` in `pages > api` and add the following code.

```typescript
[label /pages/api/fish.ts]

import type { NextApiRequest, NextApiResponse } from 'next'

type FishData = {
  speciesName: string
  physicalDescription: string
  healthBenefits: string
  image: string
}

type Error = {
  error: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<FishData | Error>
) {
    getFish(req, res)
}

async function getFish(req: NextApiRequest, res: NextApiResponse<FishData | Error>) {
  const requestedFish = req.body.fish

  fetch(`https://www.fishwatch.gov/api/species/${requestedFish}`)
  .then(fishRes => {
    if (fishRes.status === 200) return fishRes.json()

    return res.status(400).json({error: "Something's wrong with FishWatch."})
  })
  .then(fish => {
    if (fish != undefined) {
      const fishData: FishData = {
        speciesName: fish[0]['Species Name'],
        physicalDescription: fish[0]['Physical Description'],
        healthBenefits: fish[0]['Health Benefits'],
        image: fish[0]['Image Gallery'] ? fish[0]['Image Gallery'][0]['src'] : null
      }

      return res.status(200).json(fishData)
    }

    return res.status(400).json({error: "That fish doesn't have data."})
  })
}
```

Now let's walk through what this code is doing. First, you import the types for the response and request of the endpoint. Then, you define the `FishData` and `Error` types so that you know what data to expect in the response. After that is the `handler` method that receives the request and routes it to the `getFish` function.

Finally, you have the `getFish` function that calls the FishWatch API. This is how you can use Next APIs as a proxy since the front-end won't directly call the FishWatch API. In the `getFish` function, you get the specific fish that was sent in the request body. Then, you use the `requestedFish` value in the `fetch` GET request.

Once the request has been made, you can start working with the promises returned using `then` statements. The first `then` statement does a quick check to see if the response returned a successful 200 status. If it does, you pass the fish data to the next step or else you send a response with an error message.

The second `then` statement takes the fish data and checks that it exists. If it doesn't exist, you can send a response with an error. Otherwise, you take the fish data and put the information you need into the `fishData` object. When the `fishData` object is ready, you send it in the response.

That finishes up the back-end functionality, so now you can move over to the front-end.

## Step 4: Creating the front-end

You need to delete the global styles from `_app.tsx`. This is important so that the MUI styles aren't overwritten unexpectedly.

```typescript
[label /pages/_app.tsx]

import type { AppProps } from 'next/app'
<^>import '/styles/globals.css' // delete this line<^>

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

Now go to `pages > index.tsx` and delete all of the boilerplate code. This is where you'll build the user interface. Start by adding a few imports to the `index.tsx` file so you have access to a React hook, the Next Image element, and to the MUI components you need to build the UI.

```typescript
[label /pages/index.tsx]

import { useState } from 'react'
import Image from 'next/image'
import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
```

Then add a couple of type definitions below the imports. `FishData` defines what you expect from the response to get the information for the fish a user selects. `FishList` defines what you expect for options that users can select from. There are two values in the object because the request to get the fish data expects the search value in a specific format.

```typescript
[label /pages/index.tsx]

...
type FishData = {
  speciesName: string
  physicalDescription: string
  healthBenefits: string
  image: string
}

type FishList = {
  name: string
  search: string
}
```

Now let's add the function to fetch the list of fish a user can select from. You'll do this with the [`getStaticProp`](https://nextjs.org/docs/basic-features/data-fetching/get-static-props) function. The reason we're using this function instead of another method to fetch the data is because `getStaticProp` runs on the server and gets data at build time before a user makes requests.

```typescript
[label /pages/index.tsx]

...
export async function getStaticProps() {
  const fishList = [
    {
      name: 'Red Snapper',
      search: 'red-snapper'
    },
    {
      name: 'Pacific Mahimahi',
      search: 'pacific-mahimahi'
    },
    {
      name: 'Atlantic Bigeye Tuna',
      search: 'atlantic-bigeye-tuna'
    },
    {
      name: 'Vermilion Snapper',
      search: 'vermilion-snapper'
    },
    {
      name: 'Gag Grouper',
      search: 'gag-grouper'
    },
    {
      name: 'Arrowtooth Flounder',
      search: 'arrowtooth-flounder'
    },
    {
      name: 'Yellowtail Rockfish',
      search: 'yellowtail-rockfish'
    },
  ]

  return {
    props: {
      fishList,
    },
  }
}
```

This is normally where you call an endpoint or some external service to fetch your data. It's important to note that you shouldn't use API routes in a `getStaticProps` call. You can learn more about how this affects performance in the [Next docs](https://nextjs.org/docs/basic-features/data-fetching/get-static-props#write-server-side-code-directly).

The only thing left to do is create the component that will render elements for the user to interact with. In between the `FishList` type and the `getStaticProps` call, add the following code and then we'll walk through what it does.

```typescript
[label /pages/index.tsx]

...
type FishList = {
  name: string
  search: string
}

export default function Fish({ fishList }: { fishList: FishList[] }) {
  const [selectedFish, setSelectedFish] = useState<string>('')
  const [fishData, setFishData] = useState<FishData>()

  const handleChange = async (e) => {
    const newFish = e.target.value

    setSelectedFish(newFish)

    const fishDataRes = await fetch('http://localhost:3000/api/fish', {
      method: 'POST',
      body: JSON.stringify({
        fish: newFish
      })
    })

    const fishData = await fishDataRes.json()

    setFishData(fishData)
  }

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="fish-select-label">Fish</InputLabel>
        <Select
          labelId="fish-select-label"
          id="fish-select"
          value={selectedFish}
          label="Fish"
          onChange={handleChange}
        >
          {fishList && fishList.map(fish => (
            <MenuItem key={fish.search} value={fish.search}>{fish.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {fishData ? (
        <Card>
          <CardContent>
            <Typography variant="h2" color="text.primary" gutterBottom>
              {fishData.speciesName}
            </Typography>
            {fishData.image &&
              <Image alt={`Image of ${fishData.speciesName}`} src={fishData.image} height={400} width={500} />
            }
            <Typography sx={{ fontSize: 14 }} component="div">
              {fishData.healthBenefits.replace(/(<([^>]+)>)/gi, "")}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {fishData.physicalDescription.replace(/(<([^>]+)>)/gi, "")}
            </Typography>
          </CardContent>
        </Card>
      )
        :
        <Box>No data yet. Select a fish from the dropdown.</Box>
      }
    </Box>
  )
}

export async function getStaticProps() {
...
```

First, you define the `Fish` component and pass it the `fishList` prop. The `fishlist` prop comes from the `getStaticProps` call. Then you define two states, `selectedFish` and `fishData`. `selectedFish` holds the value that a user selects from the list of fish you've provided. `fishData` holds the data returned from FishWatch for the selected fish.

There's a `handleChange` function inside of the component that is triggered when a user selects a different value from the dropdown. This takes the event object from the dropdown action and you use it to get the new fish a user selects. Then it updates the `selectedFish` state with `setSelectedFish`. Next, it makes a request to the API route you built earlier to get the data for the fish. It waits for a response and then sets the `fishData` state using `setFishData`.

Finally, you can add the elements to the screen in the `return` statement. In the `Select` element, you are looping through all of the fish options from `fishList`. The value for this `Select` element is `selectedFish` and the `handleChange` function is triggered whenever there is a change action inititated by the dropdown.

Lastly, there is a ternary statement to handle some conditional rendering. If there is fish data available, then the app will show a card with the fish name, an image if one is present, the health benefits of the fish, and a physical description of the fish. If the data isn't available, a message is rendered letting the user know there isn't any data and they need to select a fish.

That's everything! Now you can run the app with `npm run dev` and you should see a screen similar to this.

![initial fish selector screen](initial_fish_selector.png)

After you select a fish, you should see the data rendered like this.

![fish data rendered in view](fish_data.png)

You now have a fully functional full-stack app built with Next.

## Conclusion

In this tutorial, you learned how to build a full-stack Next app. You were able to use API routes to create a few endpoints to serve data to the React front-end. This app can be expanded in a number directions, which is why Next has become so popular on production. Take some time to read more about the features Next offers in [their documentation](https://nextjs.org/docs/getting-started).

In the next tutorial, you will see how you can create a Postgres database and connect it to the API routes in this Next app.
