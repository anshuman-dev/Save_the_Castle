import sys
import pygame
import config
import math

from lib import *
import random




def initGame():

    pygame.init()
    pygame.mixer.init()
    screen = pygame.display.set_mode(config.SCREENSIZE)
    pygame.display.set_caption('Save The CASTLE')

    imagesdict = {}
    for i, j in config.Imagees.items():
        imagesdict[i] = pygame.image.load(j)
    sounddict = {}
    for i, j in config.Sounds.items():
        if i != 'backmusic':
            sounddict[i] = pygame.mixer.Sound(j)
    return screen, imagesdict, sounddict



def main():

    screen, imagesdict, sounddict = initGame()

    pygame.mixer.music.load(config.Sounds['backmusic'])
    pygame.mixer.music.play(-1, 0.0)#StartBeg

    font = pygame.font.Font(None, 35)

    bunny = Man(image=imagesdict.get('man'), position=(50, 50))

    acc_record = [0., 0.]

    healthvalue = 200

    arrow_sprites_group = pygame.sprite.Group()

    badguy_sprites_group = pygame.sprite.Group()
    badguy = Monster(imagesdict.get('monster'), position=(640, 100))
    badguy_sprites_group.add(badguy)

    badtimer = 100
    badtimer1 = 0

    running, exitcode = True, False
    clock = pygame.time.Clock()
    
    while running:

        screen.fill(0)

        for x in range(config.SCREENSIZE[0]//imagesdict['grass'].get_width()+1):
            for y in range(config.SCREENSIZE[1]//imagesdict['grass'].get_height()+1):
                screen.blit(imagesdict['grass'], (x*100, y*100))
        for i in range(10): screen.blit(imagesdict['castle'], (0, 30+105*i))
        
        for j in range(8): screen.blit(imagesdict['tree'], (920, 105*j))
        
 
        countdown_text = font.render(str((90000-pygame.time.get_ticks())//60000)+":"+str((90000-pygame.time.get_ticks())//1000%60).zfill(2), True, (0, 0, 0))#credits to realpython.com
        countdown_rect = countdown_text.get_rect()
        countdown_rect.topright = [800, 5]
        screen.blit(countdown_text, countdown_rect)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                sounddict['shoot'].play()
                
                mouse_pos = pygame.mouse.get_pos()
                angle = math.atan2(mouse_pos[1]-(bunny.rotated_position[1]+32), mouse_pos[0]-(bunny.rotated_position[0]+26))
                arrow = Bullet(imagesdict.get('arrow'), (angle, bunny.rotated_position[0]+32, bunny.rotated_position[1]+26))
                arrow_sprites_group.add(arrow)
                
        key_pressed = pygame.key.get_pressed()
        
        if key_pressed[pygame.K_w]:
            bunny.move(config.SCREENSIZE, 'up')
        elif key_pressed[pygame.K_s]:
            bunny.move(config.SCREENSIZE, 'down')
        elif key_pressed[pygame.K_a]:
            bunny.move(config.SCREENSIZE, 'left')
        elif key_pressed[pygame.K_d]:
            bunny.move(config.SCREENSIZE, 'right')
        
        for arrow in arrow_sprites_group:
            if arrow.update(config.SCREENSIZE):
                arrow_sprites_group.remove(arrow)
        
        if badtimer == 0:
            badguy = Monster(imagesdict.get('monster'), position=(800, random.randint(50, 600)))
            badguy_sprites_group.add(badguy)
            badtimer=100-(badtimer1*2)
            badtimer1 = 20 if badtimer1>=20 else badtimer1+2
        badtimer = badtimer - 1
        
        for badguy in badguy_sprites_group:
            if badguy.update():
                sounddict['hit'].play()
                healthvalue -= random.randint(4, 8)
                badguy_sprites_group.remove(badguy)
        
        for arrow in arrow_sprites_group:
            for badguy in badguy_sprites_group:
                if pygame.sprite.collide_mask(arrow, badguy):
                    sounddict['enemy'].play()
                    arrow_sprites_group.remove(arrow)
                    badguy_sprites_group.remove(badguy)
                    
        
        arrow_sprites_group.draw(screen)
        badguy_sprites_group.draw(screen)
        
        bunny.draw(screen, pygame.mouse.get_pos())
                
        screen.blit(imagesdict.get('healthbar'), (10, 10))
        
        for i in range(healthvalue):
            screen.blit(imagesdict.get('health'), (i+10, 10))
        
        if pygame.time.get_ticks() >= 90000:     #Credits to Realpython.com
            running, exitcode = False, True
        if healthvalue <= 0:
            running, exitcode = False, False
        
        pygame.display.flip()
        clock.tick(config.FPS)
        
        
    
    
if __name__ == '__main__':
    main()

















    
