
import pygame
import math




class Man(pygame.sprite.Sprite):
    def __init__(self, image, position, **kwargs): #Kwargs to call all arguments
        pygame.sprite.Sprite.__init__(self)
        self.image = image
        self.rect = self.image.get_rect()
        self.rect.left, self.rect.top = position
        self.speed = 3
        self.rotated_position = position

    

    def draw(self, screen, mouse_pos):
        aimangle = math.atan2(mouse_pos[1]-(self.rect.top+32), mouse_pos[0]-(self.rect.left+10))
        image_rotate = pygame.transform.rotate(self.image, 360-aimangle*70)
        position = (self.rect.left-image_rotate.get_rect().width/2, self.rect.top-image_rotate.get_rect().height/2)
        self.rotated_position = position
        screen.blit(image_rotate, position)

    def move(self, screensize, direction):
        if direction == 'left':#Using pygame library functions define movement for mainplayer
            self.rect.left = max(self.rect.left-self.speed, 0)
        elif direction == 'right':
            self.rect.left = min(self.rect.left+self.speed, screensize[0])
        elif direction == 'up':
            self.rect.top = max(self.rect.top-self.speed, 0)
        elif direction == 'down':
            self.rect.top = min(self.rect.top+self.speed, screensize[1])
        
        
        
    
   
class Bullet(pygame.sprite.Sprite):
    def __init__(self, image, position, **kwargs):     
        pygame.sprite.Sprite.__init__(self)
        self.angle = position[0]
        self.image = pygame.transform.rotate(image, 360 - position[0]*57.29)
        self.rect = self.image.get_rect()
        self.mask = pygame.mask.from_surface(self.image)
        self.rect.left, self.rect.top = position[1:]
        self.speed = 10
    
    def update(self, screensize):
        spd_xdir = math.cos(self.angle)*self.speed
        spd_ydir = math.sin(self.angle)*self.speed
        self.rect.left= self.rect.left + spd_xdir
        self.rect.top = self.rect.top + spd_ydir
        if self.rect.right < 0 or self.rect.left > screensize[0] or self.rect.top > screensize[1] or self. rect.bottom < 0:
            return True
        return False
        
class Monster(pygame.sprite.Sprite):
    def __init__(self, image, position, **kwargs):
        pygame.sprite.Sprite.__init__(self)
        self.image = image
        self.rect = self.image.get_rect()
        self.mask = pygame.mask.from_surface(self.image)
        self.rect.left, self.rect.top = position
        self.speed = 7
        
    def update(self):
        self.rect.left =self.rect.left - self.speed
        if self.rect.left < 80:
            return True
        return False
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
         
        
        
            
