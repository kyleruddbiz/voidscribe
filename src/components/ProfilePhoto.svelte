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
        onInit: (element, pswp) => {
          const fitToImage = () => {
            const image = pswp.currSlide?.content.element;

            if (!image || !pswp.element) {return;}

            const imageBounds = image.getBoundingClientRect();
            const rootBounds = pswp.element.getBoundingClientRect();

            element.style.left = `${Math.max(0, imageBounds.left - rootBounds.left)}px`;
            element.style.right = `${Math.max(0, rootBounds.right - imageBounds.right)}px`;
            element.style.bottom = `${Math.max(0, rootBounds.bottom - imageBounds.bottom)}px`;
          };

          for (const event of ['change', 'resize', 'zoomPanUpdate'] as const) {
            pswp.on(event, fitToImage);
          }

          pswp.on('openingAnimationEnd', () => {
            requestAnimationFrame(() => {
              fitToImage();
              element.classList.add('pswp__caption--visible');
            });
          });

          fitToImage();
        },
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

  @media (prefers-reduced-motion: reduce) {
    .photo {
      transition: none;
    }
  }
</style>
