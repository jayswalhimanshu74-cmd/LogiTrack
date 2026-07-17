package com.example.sales.Inventory.Management.System.user;

import com.example.sales.Inventory.Management.System.user.dto.ChangePasswordRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileRequest;
import com.example.sales.Inventory.Management.System.user.dto.UserProfileResponse;
import com.example.sales.Inventory.Management.System.user.dto.UserSecurityResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProfileService profileService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setFullName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPasswordHash("encoded_pwd");
        testUser.setPhone("1234567890");
        testUser.setRole(Role.STAFF);
        testUser.setVerified(true);
        testUser.setActive(true);
        testUser.setOauthProvider("LOCAL");
    }

    @Test
    void testGetProfile() {
        UserProfileResponse response = profileService.getProfile(testUser);
        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("LOCAL", response.getOauthProvider());
    }

    @Test
    void testUpdateProfile() {
        UserProfileRequest request = new UserProfileRequest("John Smith", "9876543210");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = profileService.updateProfile(testUser, request);
        assertNotNull(response);
        assertEquals("John Smith", response.getFullName());
        assertEquals("9876543210", response.getPhone());
    }

    @Test
    void testChangePasswordSuccess() {
        ChangePasswordRequest request = new ChangePasswordRequest("old_pwd", "new_pwd_123", "new_pwd_123");
        when(passwordEncoder.matches("old_pwd", "encoded_pwd")).thenReturn(true);
        when(passwordEncoder.encode("new_pwd_123")).thenReturn("new_encoded_pwd");
        when(passwordResetTokenRepository.findByUserAndUsedFalse(any(User.class))).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> profileService.changePassword(testUser, request));
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testChangePasswordIncorrectCurrentPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrong_pwd", "new_pwd_123", "new_pwd_123");
        when(passwordEncoder.matches("wrong_pwd", "encoded_pwd")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> profileService.changePassword(testUser, request));
        assertEquals("Current password does not match", ex.getReason());
    }

    @Test
    void testChangePasswordMismatchConfirmation() {
        ChangePasswordRequest request = new ChangePasswordRequest("old_pwd", "new_pwd_123", "new_pwd_456");
        when(passwordEncoder.matches("old_pwd", "encoded_pwd")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> profileService.changePassword(testUser, request));
        assertEquals("New password and password confirmation do not match", ex.getReason());
    }

    @Test
    void testGetSecurity() {
        UserSecurityResponse response = profileService.getSecurity(testUser);
        assertNotNull(response);
        assertEquals("john@example.com", response.getEmail());
        assertEquals("LOCAL", response.getOauthProvider());
    }

    @Test
    void testUploadAvatarInvalidMimeType() {
        MockMultipartFile file = new MockMultipartFile("file", "image.txt", "text/plain", "dummy content".getBytes());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> profileService.uploadAvatar(testUser, file));
        assertTrue(ex.getReason().contains("Invalid file format"));
    }

    @Test
    void testUploadAvatarExceedsSize() {
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6 MB
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", largeContent);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> profileService.uploadAvatar(testUser, file));
        assertTrue(ex.getReason().contains("exceeds maximum size"));
    }
}
