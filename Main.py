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
    for i, j in config.spritepics.items():
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

    font = pygame.font.Font(None, 40)

    player = Man(image=imagesdict.get('man'), position=(50, 50))

    acc_record = [0., 0.]
    time = 100
    timeless = 0
    healthvalue = 200

    group_bullet = pygame.sprite.Group()

    group_monster = pygame.sprite.Group()
    enemy = Monster(imagesdict.get('monster'), position=(640, 100))
    group_monster.add(enemy)

    
    running, exitcode = True, False
    clock = pygame.time.Clock()
    
    while running:

        screen.fill(10)

        for x in range(config.SCREENSIZE[0]//imagesdict['grass'].get_width()+1):
            for y in range(config.SCREENSIZE[1]//imagesdict['grass'].get_height()+1):
                screen.blit(imagesdict['grass'], (x*100, y*100))
        for i in range(10): screen.blit(imagesdict['castle'], (0, 105*i))
        
        for j in range(8): screen.blit(imagesdict['tree'], (920, 105*j))
        
 
        countdown_text = font.render(str((90000-pygame.time.get_ticks())//60000)+":"+str((90000-pygame.time.get_ticks())//1000%60).zfill(2), True, (0, 0, 0))#credits to realpython.com
        countdown_rect = countdown_text.get_rect()
        countdown_rect.topright = [700, 5]
        screen.blit(countdown_text, countdown_rect)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                sounddict['shoot'].play()
                
                mouse_pos = pygame.mouse.get_pos()
                shootangle = math.atan2(mouse_pos[1]-(player.rotated_position[1]+32), mouse_pos[0]-(player.rotated_position[0]+26))
                shot = Bullet(imagesdict.get('arrow'), (shootangle, player.rotated_position[0]+20, player.rotated_position[1]+26))
                group_bullet.add(shot)
                
        key_pressed = pygame.key.get_pressed()
        
        if key_pressed[pygame.K_w]:
            player.move(config.SCREENSIZE, 'up')
        elif key_pressed[pygame.K_s]:
            player.move(config.SCREENSIZE, 'down')
        elif key_pressed[pygame.K_a]:
            player.move(config.SCREENSIZE, 'left')
        elif key_pressed[pygame.K_d]:
            player.move(config.SCREENSIZE, 'right')
        
        for shot in group_bullet:
            if shot.update(config.SCREENSIZE):
                group_bullet.remove(shot)
        
        if time == 0:
            enemy = Monster(imagesdict.get('monster'), position=(800, random.randint(50, 600)))
            group_monster.add(enemy)
            time=100-(timeless*2)
            if timeless>=20:
                timeless = 20
            else:
                timeless+2
        time = time - 1
        
        for enemy in group_monster:
            if enemy.update():
                sounddict['hit'].play()
                healthvalue -= random.randint(4, 8)
                group_monster.remove(enemy)
        
        for shot in group_bullet:
            for enemy in group_monster:
                if pygame.sprite.collide_mask(shot, enemy):
                    sounddict['enemy'].play()
                    group_bullet.remove(shot)
                    group_monster.remove(enemy)
                    
        
        group_bullet.draw(screen)
        group_monster.draw(screen)
        
        player.draw(screen, pygame.mouse.get_pos())
                
        screen.blit(imagesdict.get('healthbar'), (400, 10))
        
        for i in range(healthvalue):
            screen.blit(imagesdict.get('health'), (i+400, 10))
        
        if pygame.time.get_ticks() >= 90000:     #Credits to Realpython.com
            running, exitcode = False, True
        if healthvalue <= 0:
            running, exitcode = False, False
        
        pygame.display.flip()
        clock.tick(config.FPS)
        
        
    
    
if __name__ == '__main__':
    main()

















    
