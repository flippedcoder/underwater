import { useState } from 'react'
import Image from 'next/image'
import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'

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