'use strict';
import {
    STORAGE_URL,
} from 'const';
import Image from 'ui/image';

export const getStorageUrl = url => new URL(url, STORAGE_URL);
