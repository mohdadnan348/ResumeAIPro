// components/ui/RoleSelector.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Briefcase, X } from 'lucide-react';
import styles from './RoleSelector.module.css';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  error?: string;  // '?' optional banaya
}

const AVAILABLE_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'React Native Developer',
  'MERN Stack Developer',
  'Next.js Developer',
  'Node.js Developer',
  'AI/ML Engineer',
  'Software Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile App Developer',
  'Python Developer',
  'Java Developer',
];

const RoleSelector = ({ selectedRole, onRoleSelect, error }: RoleSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRoles = AVAILABLE_ROLES.filter(role =>
    role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleSelect = (role: string) => {
    onRoleSelect(role);
    setIsCustomRole(false);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomRole = () => {
    if (searchTerm.trim()) {
      onRoleSelect(searchTerm.trim());
      setIsCustomRole(true);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onRoleSelect('');
    setIsCustomRole(false);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <label className={styles.label}>
        <Briefcase size={16} />
        <span>Target Job Role</span>
      </label>

      <div className={styles.inputWrapper} onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          value={selectedRole || searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value && !isOpen) setIsOpen(true);
          }}
          placeholder="Select or type a job role..."
          className={styles.input}
          onFocus={() => setIsOpen(true)}
        />
        {selectedRole && !isCustomRole && (
          <button onClick={handleClear} className={styles.clearBtn}>
            <X size={16} />
          </button>
        )}
        <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`} size={18} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>

          <div className={styles.rolesList}>
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <button
                  key={role}
                  className={`${styles.roleOption} ${selectedRole === role ? styles.selected : ''}`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <span>{role}</span>
                  {selectedRole === role && <span className={styles.checkmark}>✓</span>}
                </button>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>No matching roles found</p>
                {searchTerm && (
                  <button className={styles.customOption} onClick={handleCustomRole}>
                    Use "{searchTerm}" as custom role
                  </button>
                )}
              </div>
            )}
          </div>

          {searchTerm && filteredRoles.length > 0 && (
            <div className={styles.customFooter}>
              <button className={styles.customOption} onClick={handleCustomRole}>
                + Use "{searchTerm}" as custom role
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default RoleSelector;