<script lang="ts">
  import { onMount } from 'svelte';
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';
  import type { GalleryImage } from '../lib/portfolio';

  interface Props {
    photo: GalleryImage;
  }

  let { photo }: Props = $props();

  let anchorElement: HTMLAnchorElement;

  const registerCaption = (lightbox: PhotoSwipeLightbox, caption: string) => {
    lightbox.on('uiRegister', () => {
      lightbox.pswp?.ui?.registerElement({
        name: 'caption',
        order: 9,
        isButton: false,
        appendTo: 'root',
        html: caption,
      });
    });
  };

  onMount(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: anchorElement,
      pswpModule: () => import('photoswipe'),
    });

    if (photo.caption) {
      registerCaption(lightbox, photo.caption);
    }

    lightbox.init();

    return () => lightbox.destroy();
  });
</script>

<a
  class="photo"
  bind:this={anchorElement}
  href={photo.full.src}
  data-pswp-width={photo.full.width}
  data-pswp-height={photo.full.height}
  data-cropped="true"
  target="_blank"
  rel="noreferrer"
>
  <img
    src={photo.thumbnail.src}
    srcset={photo.thumbnail.srcset}
    sizes={photo.thumbnail.sizes}
    alt={photo.alt}
    decoding="async"
  />
</a>

<style>
  .photo {
    display: block;
    flex: none;
    aspect-ratio: 1;
    width: 5rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    transition: border-color 0.2s ease;
  }

  .photo:hover,
  .photo:focus-visible {
    border-color: var(--color-accent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translate(18%, -7%) scale(2);
    transform-origin: 32% 57%;
  }

  :global(.pswp__caption) {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 0.75rem 1rem;
    text-align: center;
    color: var(--color-text);
    background: rgb(0 0 0 / 0.6);
  }

  :global(.pswp__caption a) {
    color: var(--color-accent-bright);
  }

  @media (prefers-reduced-motion: reduce) {
    .photo {
      transition: none;
    }
  }
</style>
