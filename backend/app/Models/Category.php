<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'DANHMUC';
    protected $primaryKey = 'ma_dm';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
