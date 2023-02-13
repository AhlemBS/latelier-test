import { Injectable , ForbiddenException} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
// import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { NotFoundError } from 'rxjs';
@Injectable()
export class PlayersService {

async fetchPlayers() {
  const response = await axios({
    method: 'GET',
    url: 'https://data.latelier.co/training/tennis_stats/headtohead.json',
  }).catch(() => {
    throw new ForbiddenException('API not available');
  }); 
  return response.data.players;  
}

countCountryScore(country, players){
   return players.reduce( (acc,current) =>{
      if(current.country.code === country){
       return acc + current.data.points
      }
    }, 0)
}
median(values){
  if(values.length ===0) throw new Error("No inputs");

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);
  
  if (values.length % 2)
    return values[half];
  
  return (values[half - 1] + values[half]) / 2.0;
}
IMCmoyen(values){
 const imcTot = values.reduce( (acc,current) =>{
     const imc = (current.data.weight)/Math.pow(current.data.height,2);
     return acc + imc/values.length;
  }, 0)
}

bestCountry(values){
  const countryPoints = []
  // calculer le score de chaque pays
  values.forEach(element => {    
    countryPoints.push({
      country : element.country.code,
      points : this.countCountryScore(element.country.code, values)
    }) 
  });
  // pays avec les meilleurs score
  const bestCountries =  countryPoints.sort((x,y) => y.points - x.points)
  return bestCountries;
}

 async findAll() {
   const players = await this.fetchPlayers();   
   return players.sort((x,y)=>{
      return x.data.rank - y.data.rank
   })
 }
async findOne(id: number) {
    const players = await this.fetchPlayers();
    const result = players.find( player => player.id == id)
    if(!result) throw new NotFoundError('player is not found')
    return result
}



async stats() {
  const players = await this.fetchPlayers();
  return {
     bestCountries : this.bestCountry(players),
     imcMoyen : this.IMCmoyen(players),
     median : this.median(players)
  }
}
}
