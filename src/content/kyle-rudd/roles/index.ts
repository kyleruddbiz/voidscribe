import { RoleName, Skill } from '../../../lib/portfolio';
import type { Role } from '../../../lib/portfolio';
import { renderToHtml } from '../../../lib/render-to-html';
import { buildLoopingVideo } from '../../../lib/looping-video';
import djingInCostaRicaPoster from './djing-in-costa-rica.jpg';
import djingInCostaRicaVideoUrl from './djing-in-costa-rica.mp4?url';
import SoftwareEngineerBio from '../bio/software-engineer.svelte';
import MusicProducerBio from '../bio/music-producer.svelte';
import DigitalArtistBio from '../bio/digital-artist.svelte';

export const roles: Role[] = [
  {
    name: RoleName.softwareEngineer,
    bio: renderToHtml(SoftwareEngineerBio),
    skills: [
      Skill.softwareEngineering,
      Skill.architectureDesign,
      Skill.agenticCoding,
      Skill.gameDevelopment,
    ],
  },
  {
    name: RoleName.musicProducer,
    bio: renderToHtml(MusicProducerBio),
    video: await buildLoopingVideo({
      poster: djingInCostaRicaPoster,
      sources: [{ src: djingInCostaRicaVideoUrl, type: 'video/mp4' }],
      alt: 'DJing in Costa Rica',
    }),
    skills: [
      Skill.mixtapeProduction,
      Skill.musicProduction,
      Skill.mixingMastering,
      Skill.songwriting,
    ],
  },
  {
    name: RoleName.digitalArtist,
    bio: renderToHtml(DigitalArtistBio),
    skills: [
      Skill.gameDevelopment,
      Skill.videoEditing,
      Skill.uiUxDesign,
      Skill.digitalCollage,
      Skill.photoManipulation,
      Skill.surrealismGlitch,
    ],
  },
];
