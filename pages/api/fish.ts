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
  const requestedFish = JSON.parse(req.body).fish

  fetch(`https://www.fishwatch.gov/api/species/${requestedFish}`)
    .then(fishRes => {
      if (fishRes.status === 200) return fishRes.json()

      return res.status(400).json({ error: "Something's wrong with FishWatch." })
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

      return res.status(400).json({ error: "That fish doesn't have data." })
    })
}